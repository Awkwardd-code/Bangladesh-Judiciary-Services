import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { enrollmentsCol, paymentsCol } from "@/lib/collections";
import { getClientIp } from "@/lib/rate-limit";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return fail("Invalid payment ID.", 400);

    const body = await req.json().catch(() => null);
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid payment review action.", 400);

    const paymentId = new ObjectId(id);
    const paymentCollection = await paymentsCol();
    const payment = await paymentCollection.findOne({ _id: paymentId });
    if (!payment) return fail("Payment not found.", 404);
    if (payment.status !== "pending") {
      return fail("Only pending payments can be reviewed.", 409);
    }

    const enrollmentCollection = await enrollmentsCol();
    const enrollment = await enrollmentCollection.findOne({
      paymentId,
      userId: payment.userId,
      courseId: payment.courseId,
    });
    if (!enrollment || enrollment.status !== "pending") {
      return fail("Pending course enrollment not found for this payment.", 409);
    }

    const now = new Date();
    const approved = parsed.data.action === "approve";
    const enrollmentUpdate = await enrollmentCollection.updateOne(
      { _id: enrollment._id, status: "pending" },
      {
        $set: {
          status: approved ? "approved" : "rejected",
          updatedAt: now,
          ...(approved
            ? {
                approvedBy: new ObjectId(session.userId),
                approvedAt: now,
              }
            : {
                rejectedReason:
                  parsed.data.reason || "Payment not verified",
              }),
        },
      },
    );
    if (enrollmentUpdate.modifiedCount !== 1) {
      return fail("Enrollment status changed. Refresh and try again.", 409);
    }

    const paymentUpdate = await paymentCollection.updateOne(
      { _id: paymentId, status: "pending" },
      {
        $set: {
          status: approved ? "completed" : "failed",
          reviewedBy: new ObjectId(session.userId),
          reviewedAt: now,
          updatedAt: now,
          ...(approved
            ? { paidAt: now }
            : {
                rejectionReason:
                  parsed.data.reason || "Payment not verified",
              }),
        },
      },
    );
    if (paymentUpdate.modifiedCount !== 1) {
      await enrollmentCollection.updateOne(
        { _id: enrollment._id, status: approved ? "approved" : "rejected" },
        {
          $set: {
            status: "pending",
            updatedAt: new Date(),
          },
          $unset: {
            approvedBy: "",
            approvedAt: "",
            rejectedReason: "",
          },
        },
      );
      return fail("Payment status changed. Refresh and try again.", 409);
    }

    await logAdminAction(
      new ObjectId(session.userId),
      `payment.${parsed.data.action}`,
      {
        paymentId,
        enrollmentId: enrollment._id,
        previousStatus: payment.status,
      },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );

    const updatedPayment = await paymentCollection.findOne({ _id: paymentId });
    return ok({ payment: updatedPayment });
  } catch (error) {
    console.error("Review course payment error", error);
    return fail("Server error", 500);
  }
}
