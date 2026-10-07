import "server-only";

import { ObjectId } from "mongodb";

import {
  coursesCol,
  enrollmentsCol,
  preliminaryExamsCol,
  writtenExamsCol,
} from "@/lib/collections";
import { checkExamWindow } from "@/lib/exam-window";
import { getActiveExam } from "@/lib/exam-lock";
import { getEnrollmentAccess } from "@/lib/enrollment";
import type { PreliminaryExam, WrittenExam } from "@/lib/types/exam";

export type ExamKind = "preliminary" | "written" | "free";

export type ExamAccess = {
  allowed: boolean;
  reason:
    | "ok"
    | "not-published"
    | "not-yet-open"
    | "closed"
    | "not-enrolled"
    | "enrollment-pending"
    | "enrollment-rejected"
    | "another-exam-active"
    | "quota-exhausted";
  opensAt?: Date;
  closesAt?: Date;
  activeExamId?: string;
  activeExamKind?: ExamKind;
  courseSlug?: string;
};

type ExamWithCourse = (PreliminaryExam | WrittenExam) & {
  courseId?: ObjectId | string;
};

export async function checkExamAccess(
  userId: ObjectId,
  examId: ObjectId,
  kind: ExamKind,
): Promise<ExamAccess> {
  const exams =
    kind === "preliminary"
      ? await preliminaryExamsCol()
      : kind === "written"
        ? await writtenExamsCol()
        : null;

  const exam = exams
    ? ((await exams.findOne({
        _id: examId,
        status: "published",
      })) as ExamWithCourse | null)
    : null;

  if (!exam) {
    return { allowed: false, reason: "not-published" };
  }

  const window = checkExamWindow(exam);

  if (!window.open) {
    return {
      allowed: false,
      reason: window.reason,
      opensAt: window.opensAt,
      closesAt: window.closesAt,
    };
  }

  const active = await getActiveExam(userId);

  if (
    active &&
    (active.examId.toString() !== examId.toString() || active.kind !== kind)
  ) {
    return {
      allowed: false,
      reason: "another-exam-active",
      activeExamId: active.examId.toString(),
      activeExamKind: active.kind,
    };
  }

  if (exam.courseId) {
    const courseId =
      exam.courseId instanceof ObjectId
        ? exam.courseId
        : ObjectId.isValid(exam.courseId)
          ? new ObjectId(exam.courseId)
          : null;

    if (!courseId) {
      return { allowed: false, reason: "not-enrolled" };
    }

    const access = await getEnrollmentAccess(userId, courseId);

    if (!access.hasAccess) {
      if (access.reason === "pending") {
        return {
          allowed: false,
          reason: "enrollment-pending",
        };
      }

      if (access.reason === "rejected") {
        return {
          allowed: false,
          reason: "enrollment-rejected",
        };
      }

      return { allowed: false, reason: "not-enrolled" };
    }
  }

  return { allowed: true, reason: "ok" };
}

export function examAccessError(access: ExamAccess) {
  if (access.reason === "not-published") {
    return { message: "This exam is not available.", status: 403 };
  }

  if (access.reason === "not-yet-open") {
    return {
      message: `This exam opens on ${access.opensAt?.toLocaleString() ?? "a future date"}.`,
      status: 403,
    };
  }

  if (access.reason === "closed") {
    return {
      message: `This exam closed on ${access.closesAt?.toLocaleString() ?? "a past date"}.`,
      status: 403,
    };
  }

  if (access.reason === "enrollment-pending") {
    return { message: "Your enrollment is awaiting approval.", status: 403 };
  }

  if (access.reason === "enrollment-rejected") {
    return { message: "Your enrollment request was rejected.", status: 403 };
  }

  if (access.reason === "not-enrolled") {
    return { message: "You are not enrolled in this course.", status: 403 };
  }

  if (access.reason === "another-exam-active") {
    return {
      message: "You already have an exam in progress.",
      status: 409,
      extra: {
        activeExamId: access.activeExamId,
        activeExamKind: access.activeExamKind,
        message: "You already have an exam in progress.",
      },
    };
  }

  return { message: "Exam not found", status: 404 };
}
