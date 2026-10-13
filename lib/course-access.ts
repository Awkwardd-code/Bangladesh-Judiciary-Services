import { ObjectId } from "mongodb";

import { coursesCol, enrollmentsCol } from "@/lib/collections";
import type { Course, Enrollment } from "@/lib/types/course";

export type CourseAccessLevel = "full" | "partial" | "none";

export type CourseAccess = {
  hasAccess: boolean;
  level: CourseAccessLevel;
  reason: "free" | "approved" | "pending" | "rejected" | "none";
  enrollment: Enrollment | null;
};

export async function getCourseAccess(
  userId: ObjectId | null,
  course: Course,
): Promise<CourseAccess> {
  if (!userId) {
    return {
      hasAccess: false,
      level: "none",
      reason: "none",
      enrollment: null,
    };
  }

  if (course.type === "free" && course.programKind !== "exam") {
    return {
      hasAccess: true,
      level: "full",
      reason: "free",
      enrollment: null,
    };
  }

  const enrollment = await (await enrollmentsCol()).findOne({
    userId,
    courseId: course._id,
  });

  if (!enrollment) {
    return {
      hasAccess: false,
      level: "none",
      reason: "none",
      enrollment: null,
    };
  }

  if (enrollment.status === "approved") {
    return {
      hasAccess: true,
      level: "full",
      reason: "approved",
      enrollment,
    };
  }

  if (enrollment.status === "pending") {
    return {
      hasAccess: false,
      level: "partial",
      reason: "pending",
      enrollment,
    };
  }

  return {
    hasAccess: false,
    level: "none",
    reason: "rejected",
    enrollment,
  };
}
