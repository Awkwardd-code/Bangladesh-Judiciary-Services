export type SerializedFreeTest = {
  id: string;
  title: string;
  description: string;
  preliminaryDurationMinutes: number;
  writtenDurationMinutes: number;
  writtenQuestionsPerAttempt: number;
  durationMinutes: number;
  passMarkPercent: number;
  questionsPerAttempt: number;
  totalQuestions: number;
  totalMarks: number;
  status: "draft" | "published" | "archived";
  order: number;
  scheduledAt: string | null;
  closesAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ResolvedQuestion = {
  id: string;
  sourceCollection: "preliminary_questions" | "written_questions";
  questionText: string;
  options?: string[];
  maxMarks?: number;
  marks: number;
  subject: string;
};

export function serializeFreeTest(doc: any): SerializedFreeTest {
  const createdAt = doc?.createdAt ? new Date(doc.createdAt) : new Date();
  const updatedAt = doc?.updatedAt ? new Date(doc.updatedAt) : createdAt;
  const refs = Array.isArray(doc?.questions) ? doc.questions : [];
  const hasPreliminaryQuestions = refs.some(
    (reference: any) => reference?.sourceCollection === "preliminary_questions"
  );
  const hasWrittenQuestions = refs.some(
    (reference: any) => reference?.sourceCollection === "written_questions"
  );
  const hasExplicitPhaseDurations =
    typeof doc?.preliminaryDurationMinutes === "number" ||
    typeof doc?.writtenDurationMinutes === "number";
  const hasQuestionKinds = hasPreliminaryQuestions || hasWrittenQuestions;
  const durationMinutes = hasExplicitPhaseDurations
    ? (hasPreliminaryQuestions || !hasQuestionKinds
        ? Number(doc?.preliminaryDurationMinutes ?? 0)
        : 0) +
      (hasWrittenQuestions || !hasQuestionKinds
        ? Number(doc?.writtenDurationMinutes ?? 0)
        : 0)
    : Number(doc?.durationMinutes ?? 0);

  return {
    id: String(doc?._id ?? doc?.id ?? ""),
    title: String(doc?.title ?? ""),
    description: String(doc?.description ?? ""),
    preliminaryDurationMinutes: Number(
      doc?.preliminaryDurationMinutes ??
        (!hasPreliminaryQuestions && hasWrittenQuestions
          ? 0
          : doc?.durationMinutes) ??
        0
    ),
    writtenDurationMinutes: Number(
      doc?.writtenDurationMinutes ??
        (!hasPreliminaryQuestions && hasWrittenQuestions
          ? doc?.durationMinutes
          : 0) ??
        0
    ),
    writtenQuestionsPerAttempt: Number(doc?.writtenQuestionsPerAttempt ?? 0),
    durationMinutes,
    passMarkPercent: Number(doc?.passMarkPercent ?? 50),
    questionsPerAttempt: Number(doc?.questionsPerAttempt ?? 0),
    totalQuestions: Number(doc?.totalQuestions ?? 0),
    totalMarks: Number(doc?.totalMarks ?? 0),
    status: (doc?.status ?? "draft") as "draft" | "published" | "archived",
    order: Number(doc?.order ?? 0),
    scheduledAt: doc?.scheduledAt
      ? new Date(doc.scheduledAt).toISOString()
      : null,
    closesAt: doc?.closesAt ? new Date(doc.closesAt).toISOString() : null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function serializeResolvedQuestion(doc: any): ResolvedQuestion {
  const sourceCollection = String(
    doc?.sourceCollection ?? "preliminary_questions"
  ) as "preliminary_questions" | "written_questions";

  return {
    id: String(doc?._id ?? doc?.id ?? ""),
    sourceCollection,
    questionText: String(doc?.questionText ?? ""),
    options:
      Array.isArray(doc?.options) && doc.options.length > 0
        ? doc.options.map((item: unknown) => String(item))
        : undefined,
    maxMarks: typeof doc?.maxMarks === "number" ? doc.maxMarks : undefined,
    marks: Number(doc?.marks ?? doc?.maxMarks ?? 0),
    subject: String(doc?.subject ?? "General"),
  };
}
