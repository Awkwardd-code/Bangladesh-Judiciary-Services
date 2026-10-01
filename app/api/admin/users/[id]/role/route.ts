import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { logAdminAction, logAuth } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { usersCol } from "@/lib/collections";
import { getClientIp } from "@/lib/rate-limit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Invalid user id", 400);
    }

    const body = (await req.json()) as { role?: "student" | "admin" };

    if (body.role !== "student" && body.role !== "admin") {
      return fail("Role must be student or admin", 400);
    }

    const userId = new ObjectId(id);
    const collection = await usersCol();
    const user = await collection.findOne({ _id: userId });

    if (!user) {
      return fail("User not found", 404);
    }

    if (session.userId === id && body.role === "student") {
      return fail("You cannot demote yourself", 400);
    }

    const nextRole = body.role;
    const updated = await collection.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          role: nextRole,
          isAdmin: nextRole === "admin" ? 1 : 0,
          sessionVersion: (user.sessionVersion ?? 1) + 1,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") ?? "unknown";
    await logAuth("session.role-changed", {
      userId,
      email: user.email,
      ip,
      userAgent,
      meta: { previousRole: user.role, role: nextRole },
    });
    await logAdminAction(
      new ObjectId(session.userId),
      "user.role-change",
      { targetUserId: userId.toString(), previousRole: user.role, role: nextRole },
      ip,
      userAgent,
    );

    return ok({
      user: {
        id: userId.toString(),
        name: updated?.name ?? user.name,
        email: updated?.email ?? user.email,
        role: updated?.role ?? nextRole,
      },
    });
  } catch (error) {
    console.error("Update user role error", error);
    return fail("Server error", 500);
  }
}
