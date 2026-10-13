import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import {
  coursesCol,
  enrollmentsCol,
  paymentsCol,
  usersCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import type { Enrollment } from "@/lib/types/course";
import type { Payment } from "@/lib/types/payment";
import { paymentSubmitSchema } from "@/lib/validators/payment";
import { withGuard } from "@/lib/route-guard";

export const POST = withGuard({ kind: "session" }, async (req, { params, session }) => {
  try {
    const { slug } = params;
    const ipKey = `payment-submit:${getClientIp(req)}`;
    const rate = rateLimit({
      key: ipKey,
      limit: 5,
      windowMs: 300_000,
    });

    if (!rate.allowed) {
      return fail("Too many requests. Please try again later.", 429);
    }

    const body = await req.json().catch(() => null);
    const parsed = paymentSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid payment details.", 400);
    }

    const { courseId, method, senderNumber, transactionId, notes } = parsed.data;

    await ensureIndexes();

    const course = await (await coursesCol()).findOne({
      slug,
      isPublished: true,
      status: "published",
    });

    if (!course) {
      return fail("Course not found.", 404);
    }

    if (courseId !== course._id.toString()) {
      return fail("Course mismatch.", 400);
    }

    if (course.price === 0) {
      return fail("This course is free. Enroll without payment.", 400);
    }

    const userId = new ObjectId(session!.userId);
    const user = await (await usersCol()).findOne({ _id: userId });

    if (!user) {
      return fail("User not found.", 404);
    }

    const enrollmentCollection = await enrollmentsCol();
    const existingEnrollment = await enrollmentCollection.findOne({
      userId,
      courseId: course._id,
    });

    if (existingEnrollment?.status === "approved") {
      return fail("You already have access to this course.", 409);
    }

    const paymentCollection = await paymentsCol();
    const pendingPayment = await paymentCollection.findOne({
      userId,
      courseId: course._id,
      status: "pending",
    });
    if (pendingPayment) {
      return fail("You already have a pending payment review.", 409);
    }
    if (existingEnrollment?.status === "revoked") {
      return fail("Your access to this course has been revoked.", 403);
    }

    const duplicate = await paymentCollection.findOne({
      transactionId: transactionId.trim(),
    });

    if (duplicate) {
      return fail("This transaction ID has already been submitted.", 409);
    }

    const now = new Date();
    const enrollmentId = existingEnrollment?._id ?? new ObjectId();
    const payableAmount = Math.round(
      course.price * (1 - (course.discountPercent ?? 0) / 100),
    );

    const payment: Payment = {
      _id: new ObjectId(),
      userId,
      userName: user.name,
      userEmail: user.email,
      courseId: course._id,
      courseTitle: course.title,
      amount: payableAmount,
      currency: "BDT",
      method,
      status: "pending",
      transactionId: transactionId.trim(),
      senderNumber: senderNumber.trim(),
      notes: notes?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await paymentCollection.insertOne(payment);
    try {
      if (existingEnrollment) {
        const updatedEnrollment = await enrollmentCollection.updateOne(
          { _id: enrollmentId, status: existingEnrollment.status },
          {
            $set: {
              status: "pending",
              isPaid: true,
              paymentId: payment._id,
              grantedAt: now,
              updatedAt: now,
            },
            $unset: { rejectedReason: "" },
          },
        );
        if (updatedEnrollment.modifiedCount !== 1) {
          await paymentCollection.deleteOne({ _id: payment._id });
          return fail(
            "Enrollment status changed. Please refresh and try again.",
            409,
          );
        }
      } else {
        const enrollment: Enrollment = {
          _id: enrollmentId,
          courseId: course._id,
          userId,
          status: "pending",
          isPaid: true,
          paymentId: payment._id,
          grantedAt: now,
          createdAt: now,
          updatedAt: now,
        };
        await enrollmentCollection.insertOne(enrollment);
      }
    } catch (error) {
      await paymentCollection.deleteOne({ _id: payment._id });
      throw error;
    }

    return ok(
      {
        enrollmentId: enrollmentId.toString(),
        paymentId: payment._id.toString(),
        message:
          "Payment submitted. We'll verify and activate your access within 24 hours.",
      },
      201,
    );
  } catch (error) {
    console.error("Submit course payment error", error);
    return fail("Server error", 500);
  }
});
