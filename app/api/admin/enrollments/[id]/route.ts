import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { enrollmentsCol } from "@/lib/collections";
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
      return fail("Invalid enrollment id", 400);
    }

    const body = (await req.json()) as {
      action?: "approve" | "reject" | "revoke";
      reason?: string;
      paymentId?: string;
    };

    const collection = await enrollmentsCol();
    const enrollment = await collection.findOne({ _id: new ObjectId(id) });

    if (!enrollment) {
      return fail("Enrollment not found", 404);
    }

    const now = new Date();
    const update: Record<string, unknown> = {
      updatedAt: now,
      approvedBy: new ObjectId(session.userId),
      approvedAt: now,
    };

    if (body.action === "approve") {
      update.status = "approved";
      if (body.paymentId && ObjectId.isValid(body.paymentId)) {
        update.paymentId = new ObjectId(body.paymentId);
      }
    } else if (body.action === "reject") {
      update.status = "rejected";
      update.rejectedReason = body.reason || "Payment not verified";
    } else if (body.action === "revoke") {
      update.status = "revoked";
      update.rejectedReason = body.reason || "Revoked";
    } else {
      return fail("Invalid action", 400);
    }

    await collection.updateOne({ _id: enrollment._id }, { $set: update });

    await logAdminAction(
      new ObjectId(session.userId),
      `enrollment.${body.action}`,
      { enrollmentId: enrollment._id.toString(), previousStatus: enrollment.status },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );

    const updated = await collection.findOne({ _id: enrollment._id });

    return ok({ enrollment: updated });
  } catch (error) {
    console.error("Update enrollment error", error);
    return fail("Server error", 500);
  }
}
