import { ObjectId } from "mongodb";

import type { BaseDoc } from "./common";

export type ExamKind = "preliminary" | "written";
export type ExamStatus = "draft" | "published" | "archived";
export type ExamType = "free" | "paid";
export type ExamPurchaseMode = "complete" | "specific";
export type ExamLevelKind = "mcq" | "written";

export type ExamLevel = {
  _id: ObjectId;
  title: string;
  kind: ExamLevelKind;
  questionIds: ObjectId[];
  durationMinutes: number;
  passMarkPercent: number;
  marks: number;
};

export type ExamSubSegment = {
  _id: ObjectId;
  title: string;
  description: string;
  order: number;
  levels: ExamLevel[];
};

export type ExamSegment = {
  _id: ObjectId;
  title: string;
  description: string;
  order: number;
  isFree: boolean;
  price: number;
  discountedPrice?: number;
  subSegments: ExamSubSegment[];
};

export type Exam = BaseDoc & {
  title: string;
  description: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  courseId: ObjectId;
  segmentId: ObjectId;
  subSegmentId: ObjectId;
  kind: ExamKind;
  type: ExamType;
  price: number;
  discountedPrice?: number;
  validityMonths: number;
  discountTill?: Date;
  purchaseMode: ExamPurchaseMode;
  durationMinutes: number;
  passMarkPercent: number;
  negativeMarking: number;
  questionsPerAttempt: number;
  scheduledAt?: Date | null;
  closesAt?: Date | null;
  totalQuestions: number;
  totalMarks: number;
  status: ExamStatus;
  order: number;
  createdBy: ObjectId;
  segments: ExamSegment[];
};

export type ExamQuestion = BaseDoc & {
  examId: ObjectId;
  order: number;
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  maxMarks?: number;
  marks: number;
  subject?: string;
  explanation?: string;
};

export type ExamAttemptStatus =
  | "in-progress"
  | "submitted"
  | "auto-submitted"
  | "expired"
  | "graded";

export type ExamAttemptAnswer = {
  questionId: ObjectId;
  selectedOptionIndex: number | null;
  answeredAt: Date | null;
  pdfUrl?: string | null;
  pdfPublicId?: string | null;
  uploadedAt?: Date | null;
};

export type ExamAttemptPerQuestionScore = {
  questionId: ObjectId;
  awardedMarks: number;
  comment?: string;
};

export type ExamAttempt = BaseDoc & {
  examId: ObjectId;
  userId: ObjectId;
  segmentId: ObjectId;
  subSegmentId: ObjectId;
  levelId: ObjectId;
  levelKind: ExamLevelKind;
  startedAt: Date;
  expiresAt: Date;
  submittedAt?: Date;
  shuffledOrder: number[];
  answers: ExamAttemptAnswer[];
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  status: ExamAttemptStatus;
  activeLock: boolean;
  autoSubmitReason?:
    | "manual"
    | "tab-change"
    | "visibility-hidden"
    | "time-expired";
  consumedFreeAttempt: boolean;
  passMarkPercent: number;
  perQuestionScores?: ExamAttemptPerQuestionScore[];
  feedback?: string;
  gradedBy?: ObjectId;
  gradedAt?: Date;
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

export type PreliminaryAttemptAnswer = {
  questionId: ObjectId;
  selectedOptionIndex: number | null;
  answeredAt: Date | null;
};

export type PreliminaryAttempt = BaseDoc & {
  examId: ObjectId;
  userId: ObjectId;
  startedAt: Date;
  expiresAt: Date;
  submittedAt?: Date;
  shuffledOrder: number[];
  answers: PreliminaryAttemptAnswer[];
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  status: ExamAttemptStatus;
  activeLock: boolean;
  autoSubmitReason?:
    | "manual"
    | "tab-change"
    | "visibility-hidden"
    | "time-expired";
  passMarkPercent: number;
};

export type PreliminaryExam = BaseDoc & {
  title: string;
  description?: string;
  courseId?: ObjectId | null;
  topicId?: ObjectId | null;
  durationMinutes: number;
  questionsPerAttempt?: number;
  negativeMarking: number;
  totalQuestions: number;
  totalMarks: number;
  passMarkPercent: number;
  scheduledAt?: Date;
  closesAt?: Date;
  status: "draft" | "published" | "archived";
  type?: ExamType;
  monthlyTag?: string;
  weeklyTag?: string;
};

export type WrittenQuestion = BaseDoc & {
  examId: ObjectId;
  order: number;
  questionText: string;
  maxMarks: number;
  subject?: string;
  modelAnswerUrl?: string | null;
  modelAnswerPublicId?: string | null;
};

export type WrittenSubmissionAnswer = {
  questionId: ObjectId;
  pdfUrl?: string | null;
  pdfPublicId?: string | null;
  uploadedAt?: Date | null;
};

export type WrittenSubmissionScore = {
  questionId: ObjectId;
  awardedMarks: number;
  comment?: string;
};

export type WrittenSubmissionStatus =
  | "in-progress"
  | "submitted"
  | "under-review"
  | "graded";

export type WrittenSubmission = BaseDoc & {
  examId: ObjectId;
  userId: ObjectId;
  startedAt: Date;
  expiresAt: Date;
  shuffledOrder: number[];
  status: WrittenSubmissionStatus;
  selectedQuestionIds: ObjectId[];
  perQuestionAnswers: WrittenSubmissionAnswer[];
  perQuestionScores: WrittenSubmissionScore[];
  totalScore: number;
  maxScore: number;
  feedback?: string;
  submittedAt?: Date;
  answersPdfUrl?: string | null;
  answersPdfPublicId?: string | null;
  autoSubmitReason?: string | null;
  activeLock: boolean;
  gradedBy?: ObjectId;
  gradedAt?: Date;
  updatedAt: Date;
};

export type WrittenExam = BaseDoc & {
  title: string;
  description?: string;
  courseId?: ObjectId | null;
  topicId?: ObjectId | null;
  durationMinutes: number;
  questionsPerAttempt?: number;
  totalQuestions: number;
  totalMarks: number;
  passMarkPercent?: number;
  scheduledAt?: Date;
  closesAt?: Date;
  status: "draft" | "published" | "archived";
  type?: ExamType;
  monthlyTag?: string;
  weeklyTag?: string;
};

export type ActiveExam =
  | {
      kind: "preliminary" | "written" | "free";
      attemptId?: ObjectId;
      submissionId?: ObjectId;
      examId: ObjectId;
      unified?: boolean;
    }
  | null;

export type SerializedExamLevel = {
  _id: string;
  title: string;
  kind: ExamLevelKind;
  questionIds: string[];
  durationMinutes: number;
  passMarkPercent: number;
  marks: number;
};

export type SerializedExamSubSegment = {
  _id: string;
  title: string;
  description: string;
  order: number;
  levels: SerializedExamLevel[];
};

export type SerializedExamSegment = {
  _id: string;
  title: string;
  description: string;
  order: number;
  isFree: boolean;
  price: number;
  discountedPrice?: number;
  subSegments: SerializedExamSubSegment[];
};

export type SerializedExam = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  courseId: string;
  segmentId: string;
  subSegmentId: string;
  kind: ExamKind;
  type: ExamType;
  price: number;
  discountedPrice?: number;
  validityMonths: number;
  discountTill?: string;
  purchaseMode: ExamPurchaseMode;
  durationMinutes: number;
  passMarkPercent: number;
  negativeMarking: number;
  questionsPerAttempt: number;
  scheduledAt?: string;
  closesAt?: string;
  totalQuestions: number;
  totalMarks: number;
  status: ExamStatus;
  order: number;
  segments: SerializedExamSegment[];
  createdAt: string;
  updatedAt: string;
};
