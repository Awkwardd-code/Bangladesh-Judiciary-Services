import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { usersCol } from "@/lib/collections";
import { getClientIp } from "@/lib/rate-limit";

const actionSchema = z.object({
  action: z.enum(["approve", "disable", "enable"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  const parsed = actionSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return fail("Invalid student action", 400);
  }

  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Student not found", 404);
    }

    const collection = await usersCol();
    const userId = new ObjectId(id);
    const user = await collection.findOne({ _id: userId });

    if (!user || user.isAdmin === 1) {
      return fail("Student not found", 404);
    }

    const now = new Date();
    const update =
      parsed.data.action === "approve"
        ? { approved: true, updatedAt: now }
        : {
            disabled: parsed.data.action === "disable",
            ...(parsed.data.action === "disable"
              ? { sessionVersion: (user.sessionVersion ?? 1) + 1 }
              : {}),
            updatedAt: now,
          };

    await collection.updateOne({ _id: userId }, { $set: update });

    await logAdminAction(
      new ObjectId(session.userId),
      `student.${parsed.data.action}`,
      { studentId: userId.toString(), email: user.email },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );

    return ok({
      user: {
        id: userId.toString(),
        approved:
          parsed.data.action === "approve" ? true : user.approved,
        disabled: parsed.data.action === "disable",
      },
    });
  } catch (error) {
    console.error("Update student account error", error);
    return fail("Server error", 500);
  }
}