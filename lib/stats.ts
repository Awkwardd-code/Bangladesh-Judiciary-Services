import "server-only";

import { ObjectId, type Document } from "mongodb";

import { getDb } from "@/lib/db";

export type DashboardStats = {
  totals: {
    students: number;
    questions: number;
    mockExams: number;
    attempts: number;
  };
  successRate: number;
  recentAttempts: {
    date: string;
    attempts: number;
    averageScore: number;
  }[];
  tierDistribution: {
    tier: string;
    count: number;
  }[];
  topSubjects: {
    subject: string;
    accuracy: number;
  }[];
  attemptStatuses: {
    status: string;
    count: number;
  }[];
};

export type RecentAttempt = {
  id: string;
  subject: string;
  date: string;
  score: number;
  scorePercent: number;
  status: string;
  href: string;
  category: "Preliminary" | "Written" | "Free";
  correctCount: number;
  totalQuestions: number;
  durationMinutes: number;
};

export type StudentAttemptActivity = {
  recentAttempts: RecentAttempt[];
  chart: {
    date: string;
    attempts: number;
    averageScore: number;
  }[];
};

export async function getStudentAttemptActivity(
  userId: ObjectId,
  recentLimit: number | null = 5,
): Promise<StudentAttemptActivity> {
  const emptyChart = Array.from({ length: 30 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (29 - index));

    return {
      date: day.toISOString().slice(0, 10),
      attempts: 0,
      averageScore: 0,
    };
  });

  try {
    const db = await getDb();
    const [
      preliminaryAttempts,
      writtenSubmissions,
      freeTestAttempts,
      preliminaryExams,
      writtenExams,
      freeTests,
    ] = await Promise.all([
      db
        .collection("preliminary_attempts")
        .find({
          userId,
          status: { $in: ["submitted", "auto-submitted", "expired"] },
        })
        .sort({ submittedAt: -1, startedAt: -1 })
        .toArray(),
      db
        .collection("written_submissions")
        .find({
          userId,
          status: { $in: ["submitted", "under-review", "graded"] },
        })
        .sort({ submittedAt: -1, startedAt: -1 })
        .toArray(),
      db
        .collection("free_test_attempts")
        .find({
          userId,
          status: { $in: ["submitted", "expired"] },
        })
        .sort({ submittedAt: -1, startedAt: -1 })
        .toArray(),
      db.collection("preliminary_exams").find({}).toArray(),
      db.collection("written_exams").find({}).toArray(),
      db.collection("free_tests").find({}).toArray(),
    ]);

    const preliminaryExamMap = new Map(
      preliminaryExams.map((exam) => [String(exam._id), exam]),
    );
    const writtenExamMap = new Map(
      writtenExams.map((exam) => [String(exam._id), exam]),
    );
    const freeTestMap = new Map(
      freeTests.map((test) => [String(test._id), test]),
    );
    const preliminaryQuestionIds = preliminaryAttempts.flatMap((attempt) =>
      Array.isArray(attempt.answers)
        ? attempt.answers.map((answer: Document) => answer.questionId)
        : [],
    );
    const preliminaryQuestions = preliminaryQuestionIds.length
      ? await db
          .collection("preliminary_questions")
          .find({ _id: { $in: preliminaryQuestionIds } })
          .toArray()
      : [];
    const preliminaryQuestionMap = new Map(
      preliminaryQuestions.map((question) => [
        String(question._id),
        Number(question.marks) || 0,
      ]),
    );

    const attempts: RecentAttempt[] = [
      ...preliminaryAttempts.map((attempt) => {
        const exam = preliminaryExamMap.get(String(attempt.examId));
        const totalMarks = Array.isArray(attempt.answers)
          ? attempt.answers.reduce(
              (total: number, answer: Document) =>
                total +
                (preliminaryQuestionMap.get(String(answer.questionId)) ?? 0),
              0,
            )
          : Number(exam?.totalMarks) || 0;
        const score = Number(attempt.score) || 0;
        const startedAt = new Date(attempt.startedAt);
        const submittedAt = new Date(attempt.submittedAt ?? attempt.startedAt);

        return {
          id: String(attempt._id),
          subject: String(exam?.title ?? "Preliminary exam"),
          date: submittedAt.toISOString(),
          score,
          scorePercent:
            totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0,
          status: String(attempt.status ?? "submitted"),
          href: `/dashboard/mock-exams/${attempt.examId}/result?attemptId=${attempt._id}`,
          category: "Preliminary" as const,
          correctCount: Number(attempt.correctCount) || 0,
          totalQuestions: Array.isArray(attempt.answers)
            ? attempt.answers.length
            : Number(exam?.totalQuestions) || 0,
          durationMinutes: Math.max(
            0,
            Math.round((submittedAt.getTime() - startedAt.getTime()) / 60_000),
          ),
        };
      }),
      ...writtenSubmissions.map((submission) => {
        const exam = writtenExamMap.get(String(submission.examId));
        const maxScore = Number(submission.maxScore ?? exam?.totalMarks) || 0;
        const score = Number(submission.totalScore) || 0;
        const startedAt = new Date(submission.startedAt);
        const submittedAt = new Date(
          submission.submittedAt ?? submission.startedAt,
        );

        return {
          id: String(submission._id),
          subject: String(exam?.title ?? "Written exam"),
          date: submittedAt.toISOString(),
          score,
          scorePercent:
            maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
          status: String(submission.status ?? "submitted"),
          href: `/dashboard/mock-exams/written/${submission.examId}/result?attemptId=${submission._id}`,
          category: "Written" as const,
          correctCount: 0,
          totalQuestions: Array.isArray(submission.perQuestionAnswers)
            ? submission.perQuestionAnswers.length
            : Number(exam?.totalQuestions) || 0,
          durationMinutes: Math.max(
            0,
            Math.round((submittedAt.getTime() - startedAt.getTime()) / 60_000),
          ),
        };
      }),
      ...freeTestAttempts.map((attempt) => {
        const test = freeTestMap.get(String(attempt.freeTestId));
        const marks = Array.isArray(attempt.answers)
          ? attempt.answers.reduce(
              (sum: number, answer: Document) => {
                const reference = Array.isArray(test?.questions)
                  ? test.questions.find(
                      (item: Document) =>
                        String(item.questionId) ===
                          String(answer.questionId) &&
                        item.sourceCollection === answer.sourceCollection,
                    )
                  : undefined;
                return (
                  sum +
                  (Number(answer.marks ?? reference?.marks) || 0)
                );
              },
              0,
            )
          : 0;
        const score = Number(attempt.score) || 0;
        const startedAt = new Date(attempt.startedAt);
        const submittedAt = new Date(attempt.submittedAt ?? attempt.startedAt);

        return {
          id: String(attempt._id),
          subject: String(test?.title ?? "Free model test"),
          date: submittedAt.toISOString(),
          score,
          scorePercent: marks > 0 ? Math.round((score / marks) * 100) : 0,
          status: String(attempt.status ?? "submitted"),
          href: `/dashboard/free-tests/${attempt.freeTestId}/result?attemptId=${attempt._id}`,
          category: "Free" as const,
          correctCount: Number(attempt.correctCount) || 0,
          totalQuestions: Array.isArray(attempt.answers)
            ? attempt.answers.length
            : Number(test?.totalQuestions) || 0,
          durationMinutes: Math.max(
            0,
            Math.round((submittedAt.getTime() - startedAt.getTime()) / 60_000),
          ),
        };
      }),
    ].sort((left, right) => right.date.localeCompare(left.date));

    const grouped = new Map<
      string,
      { attempts: number; scoreTotal: number; scored: number }
    >();

    for (const attempt of attempts) {
      const date = attempt.date.slice(0, 10);
      if (!emptyChart.some((point) => point.date === date)) {
        continue;
      }

      const current = grouped.get(date) ?? {
        attempts: 0,
        scoreTotal: 0,
        scored: 0,
      };
      current.attempts += 1;
      if (attempt.category !== "Written" || attempt.status === "graded") {
        current.scoreTotal += attempt.scorePercent;
        current.scored += 1;
      }
      grouped.set(date, current);
    }

    const chart = emptyChart.map((point) => {
      const activity = grouped.get(point.date);
      return {
        date: point.date,
        attempts: activity?.attempts ?? 0,
        averageScore:
          activity && activity.scored > 0
            ? Math.round(activity.scoreTotal / activity.scored)
            : 0,
      };
    });

    return {
      recentAttempts:
        recentLimit === null ? attempts : attempts.slice(0, recentLimit),
      chart,
    };
  } catch (error) {
    console.error("Student attempt activity lookup failed", error);
    return {
      recentAttempts: [],
      chart: emptyChart,
    };
  }
}

const emptyStats: DashboardStats = {
  totals: {
    students: 0,
    questions: 0,
    mockExams: 0,
    attempts: 0,
  },
  successRate: 0,
  recentAttempts: [],
  tierDistribution: [],
  topSubjects: [],
  attemptStatuses: [],
};

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const db = await getDb();
    const users = db.collection("users");
    const questions = db.collection("preliminary_questions");
    const exams = db.collection("preliminary_exams");
    const attempts = db.collection("preliminary_attempts");

    const [students, questionCount, mockExams, attemptCount] =
      await Promise.all([
        users.countDocuments({ role: "student" }),
        questions.countDocuments(),
        exams.countDocuments({ status: "published" }),
        attempts.countDocuments(),
      ]);

    const [successSummary, recentRows, tiers, subjects, statuses] =
      await Promise.all([
        attempts
          .aggregate<Document>([
            {
              $lookup: {
                from: "preliminary_exams",
                localField: "examId",
                foreignField: "_id",
                as: "exam",
              },
            },
            { $unwind: { path: "$exam", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: null,
                successful: {
                  $sum: {
                    $cond: [
                      {
                        $gte: [
                          {
                            $cond: [
                              { $gt: ["$exam.totalMarks", 0] },
                              { $divide: ["$score", "$exam.totalMarks"] },
                              0,
                            ],
                          },
                          0.5,
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),
        attempts
          .aggregate<Document>([
            {
              $match: {
                startedAt: {
                  $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
            {
              $lookup: {
                from: "preliminary_exams",
                localField: "examId",
                foreignField: "_id",
                as: "exam",
              },
            },
            { $unwind: { path: "$exam", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$startedAt",
                  },
                },
                attempts: { $sum: 1 },
                averageScore: {
                  $avg: {
                    $cond: [
                      { $gt: ["$exam.totalMarks", 0] },
                      {
                        $multiply: [
                          { $divide: ["$score", "$exam.totalMarks"] },
                          100,
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
        users
          .aggregate<Document>([
            { $match: { role: "student" } },
            { $group: { _id: "$tier", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
        questions
          .aggregate<Document>([
            { $match: { subject: { $type: "string", $ne: "" } } },
            {
              $project: {
                _id: 1,
                subject: 1,
                correctOptionIndex: 1,
              },
            },
            {
              $lookup: {
                from: "preliminary_attempts",
                localField: "_id",
                foreignField: "answers.questionId",
                as: "attempts",
              },
            },
            { $unwind: "$attempts" },
            { $unwind: "$attempts.answers" },
            {
              $match: {
                $expr: { $eq: ["$attempts.answers.questionId", "$_id"] },
              },
            },
            {
              $group: {
                _id: "$subject",
                total: { $sum: 1 },
                correct: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$attempts.answers.selectedOptionIndex",
                          "$correctOptionIndex",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                subject: "$_id",
                accuracy: {
                  $round: [
                    { $multiply: [{ $divide: ["$correct", "$total"] }, 100] },
                    1,
                  ],
                },
              },
            },
            { $sort: { accuracy: -1 } },
            { $limit: 5 },
          ])
          .toArray(),
        attempts
          .aggregate<Document>([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
      ]);

    const days = new Map(
      recentRows.map((row) => [
        String(row._id),
        {
          attempts: Number(row.attempts) || 0,
          averageScore: Math.round(Number(row.averageScore) || 0),
        },
      ]),
    );
    const recentAttempts = Array.from({ length: 30 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (29 - index));
      const date = day.toISOString().slice(0, 10);

      return {
        date,
        attempts: days.get(date)?.attempts ?? 0,
        averageScore: days.get(date)?.averageScore ?? 0,
      };
    });
    const successCount = Number(successSummary[0]?.successful) || 0;
    const successTotal = Number(successSummary[0]?.count) || 0;

    return {
      totals: {
        students,
        questions: questionCount,
        mockExams,
        attempts: attemptCount,
      },
      successRate:
        successTotal === 0
          ? 0
          : Math.round((successCount / successTotal) * 1000) / 10,
      recentAttempts,
      tierDistribution: tiers.map((row) => ({
        tier: String(row._id ?? "Other"),
        count: Number(row.count) || 0,
      })),
      topSubjects: subjects.map((row) => ({
        subject: String(row.subject ?? "General"),
        accuracy: Number(row.accuracy) || 0,
      })),
      attemptStatuses: statuses.map((row) => ({
        status: String(row._id ?? "unknown"),
        count: Number(row.count) || 0,
      })),
    };
  } catch (error) {
    console.error("Dashboard statistics lookup failed", error);
    return emptyStats;
  }
}

export async function getRecentAttempts(
  userId?: ObjectId,
  limit = 5,
): Promise<RecentAttempt[]> {
  try {
    const db = await getDb();
    const attempts = await db
      .collection("preliminary_attempts")
      .aggregate<Document>([
        ...(userId ? [{ $match: { userId } }] : []),
        { $sort: { startedAt: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "preliminary_exams",
            localField: "examId",
            foreignField: "_id",
            as: "exam",
          },
        },
        { $unwind: { path: "$exam", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            startedAt: 1,
            score: 1,
            status: 1,
            examTitle: "$exam.title",
            totalMarks: "$exam.totalMarks",
          },
        },
      ])
      .toArray();

    return attempts.map((attempt) => {
      const totalMarks = Number(attempt.totalMarks) || 0;
      const score = Number(attempt.score) || 0;

      return {
        id: String(attempt._id),
        subject: String(attempt.examTitle ?? "Mock exam"),
        date: new Date(attempt.startedAt).toISOString(),
        score,
        scorePercent:
          totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0,
        status: String(attempt.status ?? "unknown"),
        href: `/dashboard/mock-exams/${attempt.examId}/result?attemptId=${attempt._id}`,
        category: "Preliminary",
        correctCount: Number(attempt.correctCount) || 0,
        totalQuestions: Array.isArray(attempt.answers)
          ? attempt.answers.length
          : 0,
        durationMinutes: 0,
      };
    });
  } catch (error) {
    console.error("Recent attempts lookup failed", error);
    return [];
  }
}
