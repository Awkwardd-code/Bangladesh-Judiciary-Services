import "server-only";

import { ObjectId } from "mongodb";

import {
  preliminaryQuestionsCol,
  usersCol,
  writtenQuestionsCol,
} from "@/lib/collections";
import { getFreeAttemptStatus, type QuotaStatus } from "@/lib/exam-quota";
import { checkExamWindow } from "@/lib/exam-window";
import { getActiveExam } from "@/lib/exam-lock";
import { getCourseAccess } from "@/lib/course-access";
import { isExamLocked } from "@/lib/exam-readiness";
import type { Course } from "@/lib/types/course";
import type { Exam } from "@/lib/types/exam";

export type ExamAccessReason =
  | "ok"
  | "not-authenticated"
  | "not-published"
  | "locked"
  | "outside-window"
  | "another-exam-active"
  | "not-enrolled"
  | "enrollment-pending"
  | "enrollment-rejected"
  | "quota-exhausted"
  | "course-free"
  | "enrolled";

export type ExamAccess = {
  allowed: boolean;
  reason: ExamAccessReason;
  willConsumeFreeAttempt: boolean;
  quotaStatus?: QuotaStatus;
  activeExamId?: string;
  activeExamKind?: "preliminary" | "written";
  opensAt?: Date;
  closesAt?: Date;
  courseSlug?: string;
};

export async function checkExamAccess(
  userId: ObjectId | null,
  examOrId: Exam | ObjectId,
  courseOrKind: Course | "preliminary" | "written" | "free",
): Promise<ExamAccess> {
  const legacyMode = courseOrKind === "preliminary" || courseOrKind === "written" || courseOrKind === "free";

  if (legacyMode) {
    const examId = examOrId as ObjectId;
    const kind = courseOrKind as "preliminary" | "written" | "free";
    const examCollection =
      kind === "preliminary"
        ? await (await import("@/lib/collections")).preliminaryExamsCol()
        : kind === "written"
          ? await (await import("@/lib/collections")).writtenExamsCol()
          : null;
    const exam = examCollection ? await examCollection.findOne({ _id: examId }) : null;

    if (!exam) {
      return { allowed: false, reason: "not-published", willConsumeFreeAttempt: false };
    }

    if (exam.status !== "published") {
      return { allowed: false, reason: "not-published", willConsumeFreeAttempt: false };
    }

    const questionCollection =
      kind === "preliminary"
        ? await preliminaryQuestionsCol()
        : await writtenQuestionsCol();
    const totalQuestions = await questionCollection.countDocuments({
      examId,
    });
    if (
      exam.isLocked ||
      isExamLocked(totalQuestions, exam.questionsPerAttempt)
    ) {
      return { allowed: false, reason: "locked", willConsumeFreeAttempt: false };
    }

    const window = checkExamWindow(exam);

    if (!window.open) {
      return {
        allowed: false,
        reason: "outside-window",
        willConsumeFreeAttempt: false,
        opensAt: window.opensAt,
        closesAt: window.closesAt,
      };
    }

    const activeExam = await getActiveExam(userId ?? new ObjectId());

    if (activeExam && activeExam.examId.toString() !== examId.toString()) {
      return {
        allowed: false,
        reason: "another-exam-active",
        willConsumeFreeAttempt: false,
        activeExamId: activeExam.examId.toString(),
        activeExamKind: activeExam.kind === "free" ? "written" : activeExam.kind,
      };
    }

    if ((exam as { type?: "free" | "paid" }).type === "free") {
      return {
        allowed: true,
        reason: "course-free",
        willConsumeFreeAttempt: false,
      };
    }

    if (!userId) {
      return { allowed: false, reason: "not-authenticated", willConsumeFreeAttempt: false };
    }

    const course = await (await import("@/lib/collections")).coursesCol().then((col) =>
      col.findOne({ _id: exam.courseId ?? exam._id }),
    );

    if (!course) {
      return { allowed: false, reason: "not-enrolled", willConsumeFreeAttempt: false };
    }

    const access = await getCourseAccess(userId, course);

    if (access.level === "full") {
      return {
        allowed: true,
        reason: "enrolled",
        willConsumeFreeAttempt: false,
      };
    }

    if (access.reason === "pending") {
      return { allowed: false, reason: "enrollment-pending", willConsumeFreeAttempt: false };
    }

    if (access.reason === "rejected") {
      return { allowed: false, reason: "enrollment-rejected", willConsumeFreeAttempt: false };
    }

    const quotaStatus = await getFreeAttemptStatus(userId);

    if (quotaStatus.remaining <= 0) {
      return {
        allowed: false,
        reason: "quota-exhausted",
        willConsumeFreeAttempt: false,
        quotaStatus,
      };
    }

    return {
      allowed: true,
      reason: "ok",
      willConsumeFreeAttempt: true,
      quotaStatus,
    };
  }

  const exam = examOrId as Exam;
  const course = courseOrKind as Course;
  if (!userId) {
    return {
      allowed: false,
      reason: "not-authenticated",
      willConsumeFreeAttempt: false,
    };
  }

  if (exam.status !== "published") {
    return {
      allowed: false,
      reason: "not-published",
      willConsumeFreeAttempt: false,
    };
  }

  const window = checkExamWindow(exam);

  if (!window.open) {
    return {
      allowed: false,
      reason: "outside-window",
      willConsumeFreeAttempt: false,
    };
  }

  const activeExam = await getActiveExam(userId);

  if (activeExam && activeExam.examId.toString() !== exam._id.toString()) {
    return {
      allowed: false,
      reason: "another-exam-active",
      willConsumeFreeAttempt: false,
      activeExamId: activeExam.examId.toString(),
      activeExamKind: activeExam.kind === "free" ? "written" : activeExam.kind,
    };
  }

  const access = await getCourseAccess(userId, course);

  if (
    (course.type === "free" && course.programKind !== "exam") ||
    access.level === "full"
  ) {
    return {
      allowed: true,
      reason: course.type === "free" ? "course-free" : "enrolled",
      willConsumeFreeAttempt: false,
    };
  }

  if (access.reason === "pending") {
    return {
      allowed: false,
      reason: "enrollment-pending",
      willConsumeFreeAttempt: false,
    };
  }

  if (access.reason === "rejected") {
    return {
      allowed: false,
      reason: "enrollment-rejected",
      willConsumeFreeAttempt: false,
    };
  }

  if (!access.hasAccess && access.reason === "none") {
    return {
      allowed: false,
      reason: "not-enrolled",
      willConsumeFreeAttempt: false,
    };
  }

  const quotaStatus = await getFreeAttemptStatus(userId);

  if (quotaStatus.remaining <= 0) {
    return {
      allowed: false,
      reason: "quota-exhausted",
      willConsumeFreeAttempt: false,
      quotaStatus,
    };
  }

  return {
    allowed: true,
    reason: "ok",
    willConsumeFreeAttempt: true,
    quotaStatus,
  };
}

export function examAccessError(access: ExamAccess): {
  message: string;
  status: number;
  extra?: Record<string, unknown>;
} {
  if (access.reason === "not-authenticated") {
    return { message: "Not authenticated.", status: 401 };
  }

  if (access.reason === "not-published") {
    return { message: "This exam is not available.", status: 404 };
  }

  if (access.reason === "locked") {
    return { message: "Questions for this exam are being prepared.", status: 403 };
  }

  if (access.reason === "quota-exhausted") {
    return {
      message: "You have used all free exam attempts.",
      status: 403,
    };
  }

  if (access.reason === "outside-window") {
    return {
      message:
        access.opensAt && access.opensAt > new Date()
          ? `This exam opens on ${access.opensAt.toLocaleString()}.`
          : `This exam closed on ${access.closesAt?.toLocaleString() ?? "a past date"}.`,
      status: 403,
    };
  }

  if (access.reason === "another-exam-active") {
    return {
      message: "You already have an exam in progress.",
      status: 409,
      extra: {
        activeExamId: access.activeExamId,
        activeExamKind: access.activeExamKind,
      },
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

  return { message: "Exam access is not available.", status: 403 };
}
