import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { noticesCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";
import { noticeCreateSchema } from "@/lib/validators/notice";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);

  try {
    await ensureIndexes();
    const params = new URL(req.url).searchParams;
    const { page, limit } = parsePagination(params);
    const search = params.get("search")?.trim();
    const status = params.get("status");
    const filter: Record<string, unknown> = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: escapedSearch, $options: "i" };
    }
    if (status === "draft" || status === "published") filter.status = status;

    const collection = await noticesCol();
    const [notices, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ pinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return ok({
      notices,
      pagination: buildPaginationMeta({ page, limit }, total),
    });
  } catch (error) {
    console.error("List notices error", error);
    return fail("Server error", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);

  try {
    const parsed = noticeCreateSchema.safeParse(await req.json());
    if (!parsed.success)
      return fail(parsed.error.issues[0]?.message ?? "Invalid notice", 400);
    await ensureIndexes();
    const now = new Date();
    const notice = {
      _id: new ObjectId(),
      ...parsed.data,
      publishedAt: parsed.data.status === "published" ? now : undefined,
      createdBy: new ObjectId(session.userId),
      createdAt: now,
      updatedAt: now,
    };
    await (await noticesCol()).insertOne(notice);
    return ok({ notice }, 201);
  } catch (error) {
    console.error("Create notice error", error);
    return fail("Server error", 500);
  }
}
