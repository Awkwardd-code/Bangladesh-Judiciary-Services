import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { noticesCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { getClientIp } from "@/lib/rate-limit";
import { noticeUpdateSchema } from "@/lib/validators/notice";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    await ensureIndexes();
    const { id } = await params;
    const notice = await (
      await noticesCol()
    ).findOne({ _id: new ObjectId(id) });
    return notice ? ok({ notice }) : fail("Notice not found", 404);
  } catch (error) {
    console.error("Get notice error", error);
    return fail("Server error", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    await ensureIndexes();
    const parsed = noticeUpdateSchema.safeParse(await req.json());
    if (!parsed.success)
      return fail(parsed.error.issues[0]?.message ?? "Invalid notice", 400);
    const { id } = await params;
    const collection = await noticesCol();
    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) return fail("Notice not found", 404);
    const publishedAt =
      parsed.data.status === "published" && existing.status === "draft"
        ? new Date()
        : existing.publishedAt;
    await collection.updateOne(
      { _id: existing._id },
      { $set: { ...parsed.data, publishedAt, updatedAt: new Date() } },
    );
    const notice = await collection.findOne({ _id: existing._id });
    await logAdminAction(
      new ObjectId(session.userId),
      "notice.update",
      { noticeId: existing._id.toString(), previousStatus: existing.status },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );
    return ok({ notice });
  } catch (error) {
    console.error("Update notice error", error);
    return fail("Server error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    const { id } = await params;
    const noticeId = new ObjectId(id);
    const result = await (await noticesCol()).deleteOne({ _id: noticeId });
    if (result.deletedCount) {
      await logAdminAction(
        new ObjectId(session.userId),
        "notice.delete",
        { noticeId: noticeId.toString() },
        getClientIp(req),
        req.headers.get("user-agent") ?? "unknown",
      );
    }
    return result.deletedCount
      ? ok({ message: "Notice deleted." })
      : fail("Notice not found", 404);
  } catch (error) {
    console.error("Delete notice error", error);
    return fail("Server error", 500);
  }
}
