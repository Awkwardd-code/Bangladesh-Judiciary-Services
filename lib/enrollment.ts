import { ObjectId } from "mongodb";

import { coursesCol, enrollmentsCol } from "@/lib/collections";
import type { Enrollment } from "@/lib/types/course";

export async function getEnrollmentAccess(
  userId: ObjectId,
  courseId: ObjectId,
): Promise<{
  hasAccess: boolean;
  enrollment: Enrollment | null;
  reason: "free" | "approved" | "pending" | "rejected" | "none";
}> {
  const course = await (await coursesCol()).findOne({ _id: courseId });

  if (!course) {
    return { hasAccess: false, enrollment: null, reason: "none" };
  }

  const enrollment = await (await enrollmentsCol()).findOne({
    userId,
    courseId,
  });

  if (!enrollment) {
    if (course.price === 0) {
      return { hasAccess: true, enrollment: null, reason: "free" };
    }

    return { hasAccess: false, enrollment: null, reason: "none" };
  }

  if (enrollment.status === "approved") {
    return { hasAccess: true, enrollment, reason: "approved" };
  }

  if (enrollment.status === "pending") {
    return { hasAccess: false, enrollment, reason: "pending" };
  }

  return { hasAccess: false, enrollment, reason: "rejected" };
}

export async function autoEnrollFreeCourse(
  userId: ObjectId,
  courseId: ObjectId,
): Promise<Enrollment> {
  const collection = await enrollmentsCol();
  const existing = await collection.findOne({ userId, courseId });

  if (existing) {
    return existing;
  }

  const now = new Date();
  const enrollment: Enrollment = {
    _id: new ObjectId(),
    courseId,
    userId,
    status: "approved",
    isPaid: false,
    grantedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(enrollment);

  return enrollment;
}
