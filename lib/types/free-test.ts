import { ObjectId } from "mongodb";

import type { BaseDoc } from "./common";

export type FreeTestStatus = "draft" | "published" | "archived";

export type FreeTestQuestionRef = {
  sourceCollection: "preliminary_questions" | "written_questions";
  questionId: ObjectId;
  marks: number;
  order: number;
};

export type FreeTest = BaseDoc & {
  title: string;
  description: string;
  preliminaryDurationMinutes?: number;
  writtenDurationMinutes?: number;
  writtenQuestionsPerAttempt?: number;
  /** @deprecated Use phase-specific durations. */
  durationMinutes: number;
  passMarkPercent: number;
  questionsPerAttempt: number;
  questions: FreeTestQuestionRef[];
  totalQuestions: number;
  totalMarks: number;
  status: FreeTestStatus;
  scheduledAt?: Date;
  closesAt?: Date;
  order: number;
  createdBy: ObjectId;
};

export type FreeTestAttemptStatus = "in-progress" | "submitted" | "expired";

export type FreeTestAttemptAnswer = {
  questionId: ObjectId;
  sourceCollection: "preliminary_questions" | "written_questions";
  marks?: number;
  selectedOptionIndex: number | null;
  answeredAt: Date | null;
  pdfUrl?: string | null;
  pdfPublicId?: string | null;
  uploadedAt?: Date | null;
};

export type FreeTestAttempt = BaseDoc & {
  freeTestId: ObjectId;
  userId: ObjectId;
  startedAt: Date;
  currentPhase?: "preliminary" | "written";
  phaseStartedAt?: Date;
  preliminaryDurationMinutes?: number;
  writtenDurationMinutes?: number;
  passMarkPercent?: number;
  preliminaryEndsAt?: Date;
  writtenEndsAt?: Date;
  expiresAt: Date;
  submittedAt?: Date;
  shuffledOrder: number[];
  answers: FreeTestAttemptAnswer[];
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  status: FreeTestAttemptStatus;
  activeLock: boolean;
  autoSubmitReason?:
    "manual" | "tab-change" | "visibility-hidden" | "time-expired";
};

export type FreeTestAccess = {
  hasFreeAttempt: boolean;
  freeAttemptsUsed: number;
  freeAttemptsLimit: number;
  freeAttemptsLeft: number;
  locked: boolean;
};
