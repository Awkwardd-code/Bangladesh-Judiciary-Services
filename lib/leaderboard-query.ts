import "server-only";

import { ObjectId } from "mongodb";

import {
  freeTestAttemptsCol,
  freeTestsCol,
  preliminaryAttemptsCol,
  preliminaryExamsCol,
  preliminaryQuestionsCol,
  usersCol,
  writtenExamsCol,
  writtenQuestionsCol,
  writtenSubmissionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
export type LeaderboardKind = "preliminary" | "written" | "free";

export type LeaderboardRow = {
  rank: number;
  userId: string;
  userName: string;
  userEmail: string;
  userRoll?: string | null;
  attemptId: string;
  examId: string;
  examTitle: string;
  examKind: LeaderboardKind;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  accuracyPercent: number;
  submittedAt: string;
  autoSubmitReason?: string | null;
  passMarkPercent?: number | null;
};

export type LeaderboardFilters = {
  examId?: string;
  examKind?: LeaderboardKind;
  search?: string;
  limit?: number;
};

type AttemptAnswer = {
  questionId: ObjectId;
  marks?: number;
  sourceCollection?: "preliminary_questions" | "written_questions";
};

type AttemptRecord = {
  _id: ObjectId;
  userId: ObjectId;
  examId?: ObjectId;
  freeTestId?: ObjectId;
  score?: number;
  totalScore?: number;
  maxScore?: number;
  correctCount?: number;
  wrongCount?: number;
  skippedCount?: number;
  submittedAt?: Date;
  status: string;
  autoSubmitReason?: string | null;
  answers?: AttemptAnswer[];
  passMarkPercent?: number;
};

type SourceRecord = {
  kind: LeaderboardKind;
  attempt: AttemptRecord;
};

const SOURCE_LIMIT = 500;
const SUBMITTED_STATUSES = [
  "submitted",
  "auto-submitted",
  "graded",
  "under-review",
];

function accuracyPercent(
  correctCount: number,
  wrongCount: number,
  skippedCount: number
) {
  const total = correctCount + wrongCount + skippedCount;
  return total === 0 ? 0 : (correctCount / total) * 100;
}

async function loadAttempts(
  kind: LeaderboardKind,
  examId?: ObjectId
): Promise<SourceRecord[]> {
  const filter = {
    status: { $in: SUBMITTED_STATUSES },
    ...(kind === "free"
      ? examId
        ? { freeTestId: examId }
        : {}
      : examId
        ? { examId }
        : {}),
  };

  const collection =
    kind === "preliminary"
      ? await preliminaryAttemptsCol()
      : kind === "written"
        ? await writtenSubmissionsCol()
        : await freeTestAttemptsCol();
  const sort =
    kind === "written"
      ? { totalScore: -1, submittedAt: 1, _id: 1 }
      : { score: -1, submittedAt: 1, _id: 1 };
  const attempts = await collection
    .aggregate<AttemptRecord>([
      { $match: filter },
      { $sort: sort },
      { $limit: SOURCE_LIMIT },
      {
        $project: {
          userId: 1,
          examId: 1,
          freeTestId: 1,
          score: 1,
          totalScore: 1,
          maxScore: 1,
          correctCount: 1,
          wrongCount: 1,
          skippedCount: 1,
          submittedAt: 1,
          status: 1,
          autoSubmitReason: 1,
          answers: 1,
          passMarkPercent: 1,
        },
      },
    ])
    .toArray();

  return attempts.map((attempt) => ({ kind, attempt }));
}

export async function listLeaderboard(
  filters: LeaderboardFilters = {}
): Promise<LeaderboardRow[]> {
  await ensureIndexes();

  const examId =
    filters.examId && ObjectId.isValid(filters.examId)
      ? new ObjectId(filters.examId)
      : undefined;

  if (filters.examId && !examId) {
    throw new Error("Invalid exam ID.");
  }

  const kinds: LeaderboardKind[] = filters.examKind
    ? [filters.examKind]
    : ["preliminary", "written", "free"];
  const sources = await Promise.all(
    kinds.map((kind) => loadAttempts(kind, examId))
  );
  const records = sources.flat();
  const userIds = [
    ...new Set(records.map(({ attempt }) => attempt.userId.toString())),
  ].map((id) => new ObjectId(id));
  const examIds = [
    ...new Set(
      records.flatMap(({ kind, attempt }) => {
        const id = kind === "free" ? attempt.freeTestId : attempt.examId;
        return id ? [id.toString()] : [];
      })
    ),
  ].map((id) => new ObjectId(id));

  const [users, preliminaryExams, writtenExams, freeTests] = await Promise.all([
    userIds.length
      ? (await usersCol()).find({ _id: { $in: userIds } }).toArray()
      : [],
    examIds.length
      ? (await preliminaryExamsCol()).find({ _id: { $in: examIds } }).toArray()
      : [],
    examIds.length
      ? (await writtenExamsCol()).find({ _id: { $in: examIds } }).toArray()
      : [],
    examIds.length
      ? (await freeTestsCol()).find({ _id: { $in: examIds } }).toArray()
      : [],
  ]);
  const userById = new Map(users.map((user) => [user._id.toString(), user]));
  const preliminaryById = new Map(
    preliminaryExams.map((exam) => [exam._id.toString(), exam])
  );
  const writtenById = new Map(
    writtenExams.map((exam) => [exam._id.toString(), exam])
  );
  const freeById = new Map(
    freeTests.map((exam) => [exam._id.toString(), exam])
  );
  const preliminaryQuestionIds = records.flatMap(({ kind, attempt }) =>
    kind === "preliminary"
      ? (attempt.answers ?? []).map((answer) => answer.questionId)
      : []
  );
  const freeQuestionIds = records.flatMap(({ kind, attempt }) =>
    kind === "free"
      ? (attempt.answers ?? []).map((answer) => answer.questionId)
      : []
  );
  const [preliminaryQuestions, freePreliminaryQuestions, freeWrittenQuestions] =
    await Promise.all([
      preliminaryQuestionIds.length
        ? (await preliminaryQuestionsCol())
            .find({ _id: { $in: preliminaryQuestionIds } })
            .toArray()
        : [],
      freeQuestionIds.length
        ? (await preliminaryQuestionsCol())
            .find({ _id: { $in: freeQuestionIds } })
            .toArray()
        : [],
      freeQuestionIds.length
        ? (await writtenQuestionsCol())
            .find({ _id: { $in: freeQuestionIds } })
            .toArray()
        : [],
    ]);
  const preliminaryQuestionById = new Map(
    preliminaryQuestions.map((question) => [question._id.toString(), question])
  );
  const freeQuestionByKey = new Map<
    string,
    { marks?: number; maxMarks?: number }
  >();
  freePreliminaryQuestions.forEach((question) => {
    freeQuestionByKey.set(`preliminary_questions:${question._id.toString()}`, {
      marks: question.marks,
    });
  });
  freeWrittenQuestions.forEach((question) => {
    freeQuestionByKey.set(`written_questions:${question._id.toString()}`, {
      maxMarks: question.maxMarks,
    });
  });
  const search = filters.search?.trim().toLocaleLowerCase();

  const rows = records.flatMap(({ kind, attempt }) => {
    const id = kind === "free" ? attempt.freeTestId : attempt.examId;

    if (!id) {
      return [];
    }

    const user = userById.get(attempt.userId.toString());
    const preliminaryExam = preliminaryById.get(id.toString());
    const writtenExam = writtenById.get(id.toString());
    const freeTest = freeById.get(id.toString());
    const exam =
      kind === "preliminary"
        ? preliminaryExam
        : kind === "written"
          ? writtenExam
          : freeTest;
    const userName = user?.name ?? "Unknown student";
    const userEmail = user?.email ?? "";

    if (
      search &&
      !`${userName} ${userEmail}`.toLocaleLowerCase().includes(search)
    ) {
      return [];
    }

    const answers = attempt.answers ?? [];
    const questionTotal = answers.reduce((sum, answer) => {
      if (kind === "preliminary") {
        return (
          sum +
          (preliminaryQuestionById.get(answer.questionId.toString())?.marks ??
            0)
        );
      }

      if (kind === "free") {
        const reference = freeTest?.questions.find((question) =>
          question.questionId.equals(answer.questionId)
        );
        const sourceCollection =
          answer.sourceCollection ?? reference?.sourceCollection;
        const question = sourceCollection
          ? freeQuestionByKey.get(
              `${sourceCollection}:${answer.questionId.toString()}`
            )
          : undefined;

        return (
          sum +
          (answer.marks ??
            reference?.marks ??
            question?.marks ??
            question?.maxMarks ??
            0)
        );
      }

      return sum;
    }, 0);
    const totalMarks =
      kind === "written"
        ? attempt.maxScore || writtenExam?.totalMarks || 0
        : questionTotal || exam?.totalMarks || 0;
    const correctCount = attempt.correctCount ?? 0;
    const wrongCount = attempt.wrongCount ?? 0;
    const skippedCount = attempt.skippedCount ?? 0;
    const submittedAt =
      attempt.submittedAt?.toISOString() ?? new Date(0).toISOString();

    return [
      {
        rank: 0,
        userId: attempt.userId.toString(),
        userName,
        userEmail,
        userRoll: user?.roll ?? null,
        attemptId: attempt._id.toString(),
        examId: id.toString(),
        examTitle: exam?.title ?? "Unavailable exam",
        examKind: kind,
        score:
          kind === "written" ? (attempt.totalScore ?? 0) : (attempt.score ?? 0),
        totalMarks,
        correctCount,
        wrongCount,
        skippedCount,
        accuracyPercent: accuracyPercent(
          correctCount,
          wrongCount,
          skippedCount
        ),
        submittedAt,
        autoSubmitReason: attempt.autoSubmitReason ?? null,
        passMarkPercent:
          kind === "free"
            ? (attempt.passMarkPercent ?? freeTest?.passMarkPercent ?? null)
            : null,
      } satisfies LeaderboardRow,
    ];
  });

  rows.sort((left, right) => {
    const scoreDifference = right.score - left.score;

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return (
      new Date(left.submittedAt).getTime() -
      new Date(right.submittedAt).getTime()
    );
  });

  let rank = 0;
  let previousScore: number | undefined;
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500);

  return rows.slice(0, limit).map((row) => {
    if (row.score !== previousScore) {
      rank += 1;
      previousScore = row.score;
    }

    return { ...row, rank };
  });
}

export type LeaderboardExamOption = {
  id: string;
  title: string;
  kind: LeaderboardKind;
};

export async function listLeaderboardExamOptions(): Promise<
  LeaderboardExamOption[]
> {
  await ensureIndexes();

  const [preliminaryExams, writtenExams, freeTests] = await Promise.all([
    (await preliminaryExamsCol())
      .find({ status: "published" }, { projection: { title: 1 } })
      .sort({ title: 1 })
      .toArray(),
    (await writtenExamsCol())
      .find({ status: "published" }, { projection: { title: 1 } })
      .sort({ title: 1 })
      .toArray(),
    (await freeTestsCol())
      .find({ status: "published" }, { projection: { title: 1 } })
      .sort({ title: 1 })
      .toArray(),
  ]);

  return [
    ...preliminaryExams.map((exam) => ({
      id: exam._id.toString(),
      title: exam.title,
      kind: "preliminary" as const,
    })),
    ...writtenExams.map((exam) => ({
      id: exam._id.toString(),
      title: exam.title,
      kind: "written" as const,
    })),
    ...freeTests.map((exam) => ({
      id: exam._id.toString(),
      title: exam.title,
      kind: "free" as const,
    })),
  ];
}
