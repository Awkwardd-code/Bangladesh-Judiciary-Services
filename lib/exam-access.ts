import "server-only";

import { ObjectId } from "mongodb";

import {
  coursesCol,
  enrollmentsCol,
  preliminaryExamsCol,
  writtenExamsCol,
} from "@/lib/collections";
import { getActiveExam } from "@/lib/exam-lock";
import type { PreliminaryExam, WrittenExam } from "@/lib/types/exam";

export type ExamAccess = {
  allowed: boolean;
  reason:
    | "ok"
    | "not-authenticated"
    | "not-enrolled"
    | "another-exam-active"
    | "not-published"
    | "outside-window";
  activeExamId?: string;
  activeExamKind?: "preliminary" | "written";
};

type ExamWithCourse = (PreliminaryExam | WrittenExam) & {
  courseId?: ObjectId | string;
};

export async function checkExamAccess(
  userId: ObjectId,
  examId: ObjectId,
  kind: "preliminary" | "written",
): Promise<ExamAccess> {
  const exams =
    kind === "preliminary"
      ? await preliminaryExamsCol()
      : await writtenExamsCol();
  const exam = (await exams.findOne({
    _id: examId,
    status: "published",
  })) as ExamWithCourse | null;

  if (!exam) {
    return { allowed: false, reason: "not-published" };
  }

  const now = new Date();
  if (
    (exam.scheduledAt && now < exam.scheduledAt) ||
    (exam.closesAt && now > exam.closesAt)
  ) {
    return { allowed: false, reason: "outside-window" };
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

    const course = await (await coursesCol()).findOne({ _id: courseId });

    if (!course) {
      return { allowed: false, reason: "not-enrolled" };
    }

    if (course.price > 0) {
      const enrollment = await (await enrollmentsCol()).findOne({
        userId,
        courseId,
        status: "approved",
      });

      if (!enrollment) {
        return { allowed: false, reason: "not-enrolled" };
      }
    }
  }

  return { allowed: true, reason: "ok" };
}

export function examAccessError(access: ExamAccess) {
  if (access.reason === "not-authenticated") {
    return { message: "Not authenticated", status: 401 };
  }

  if (access.reason === "not-enrolled") {
    return { message: "You are not enrolled in this exam.", status: 403 };
  }

  if (access.reason === "another-exam-active") {
    return {
      message: "You already have an active exam.",
      status: 409,
      extra: {
        active: {
          examId: access.activeExamId,
          kind: access.activeExamKind,
        },
      },
    };
  }

  if (access.reason === "outside-window") {
    return { message: "This exam is not currently open.", status: 403 };
  }

  return { message: "Exam not found", status: 404 };
}
