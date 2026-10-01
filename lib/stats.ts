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
};

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
      };
    });
  } catch (error) {
    console.error("Recent attempts lookup failed", error);
    return [];
  }
}
