import { ObjectId } from "mongodb";

import type { BaseDoc } from "./common";

export type ExamStatus = "draft" | "published" | "archived";

export type PreliminaryExam = BaseDoc & {
  title: string;
  description?: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  questionsPerAttempt?: number;
  status: ExamStatus;
  scheduledAt?: Date;
  closesAt?: Date;
  createdBy: ObjectId;
};

export type PreliminaryQuestion = BaseDoc & {
  examId: ObjectId;
  order: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
  subject?: string;
  explanation?: string;
};

export type AttemptStatus =
  "in-progress" | "submitted" | "auto-submitted" | "expired";

export type AutoSubmitReason =
  "tab-change" | "time-expired" | "manual" | "visibility-hidden";

export type PreliminaryAttempt = BaseDoc & {
  examId: ObjectId;
  userId: ObjectId;
  startedAt: Date;
  submittedAt?: Date;
  expiresAt: Date;
  answers: {
    questionId: ObjectId;
    selectedOptionIndex: number | null;
    answeredAt?: Date | null;
  }[];
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  status: AttemptStatus;
  activeLock: boolean;
  shuffledOrder: number[];
  autoSubmitReason?: AutoSubmitReason;
};

export type WrittenExam = BaseDoc & {
  title: string;
  description?: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  questionsPerAttempt?: number;
  status: ExamStatus;
  scheduledAt?: Date;
  closesAt?: Date;
  createdBy: ObjectId;
};

export type WrittenQuestion = BaseDoc & {
  examId: ObjectId;
  order: number;
  questionText: string;
  maxMarks: number;
  subject?: string;
  modelAnswerUrl?: string;
  modelAnswerPublicId?: string;
};

export type SubmissionStatus =
  "in-progress" | "submitted" | "under-review" | "graded";

export type WrittenSubmission = BaseDoc & {
  examId: ObjectId;
  userId: ObjectId;
  startedAt: Date;
  submittedAt?: Date;
  expiresAt: Date;
  answersPdfUrl: string;
  answersPdfPublicId: string;
  status: SubmissionStatus;
  totalScore: number;
  maxScore: number;
  feedback?: string;
  gradedBy?: ObjectId;
  gradedAt?: Date;
  activeLock: boolean;
  shuffledOrder: number[];
  selectedQuestionIds?: ObjectId[];
  autoSubmitReason?: AutoSubmitReason;
  perQuestionAnswers: {
    questionId: ObjectId;
    pdfUrl?: string | null;
    pdfPublicId?: string | null;
    uploadedAt?: Date | null;
  }[];
  perQuestionScores: {
    questionId: ObjectId;
    awardedMarks: number;
    comment?: string;
  }[];
};

export type ActiveExam =
  | {
      kind: "preliminary";
      attemptId: ObjectId;
      examId: ObjectId;
    }
  | {
      kind: "written";
      submissionId: ObjectId;
      examId: ObjectId;
    }
  | {
      kind: "free";
      attemptId: ObjectId;
      examId: ObjectId;
    }
  | null;
