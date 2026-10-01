import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-guard";
import { coursesCol, enrollmentsCol } from "@/lib/collections";
import { autoEnrollFreeCourse } from "@/lib/enrollment";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import type { Enrollment } from "@/lib/types/course";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await requireSession();

  if (!session) {
    return fail("Unauthorized", 401);
  }

  try {
    const { slug } = await params;
    const ipKey = `enroll:${getClientIp(req)}`;
    const rate = rateLimit({ key: ipKey, limit: 10, windowMs: 60_000 });

    if (!rate.allowed) {
      return fail("Too many requests. Please try again later.", 429);
    }

    const course = await (await coursesCol()).findOne({ slug });

    if (!course) {
      return fail("Course not found", 404);
    }

    const userId = new ObjectId(session.userId);
    const collection = await enrollmentsCol();

    if (course.price === 0) {
      const enrollment = await autoEnrollFreeCourse(userId, course._id);
      return ok({
        status: enrollment.status,
        enrollmentId: enrollment._id.toString(),
      });
    }

    const existing = await collection.findOne({
      userId,
      courseId: course._id,
    });

    if (existing && ["approved", "pending"].includes(existing.status)) {
      return ok({
        status: existing.status,
        enrollmentId: existing._id.toString(),
      });
    }

    const now = new Date();
    const enrollment: Enrollment = {
      _id: new ObjectId(),
      courseId: course._id,
      userId,
      status: "pending",
      isPaid: true,
      grantedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(enrollment);

    return ok({
      status: "pending",
      enrollmentId: enrollment._id.toString(),
    });
  } catch (error) {
    console.error("Enroll in course error", error);
    return fail("Server error", 500);
  }
}
