import "server-only";

import { ObjectId } from "mongodb";

import {
  coursesCol,
  enrollmentsCol,
  examAttemptsCol,
  examsCol,
  paymentsCol,
  usersCol,
} from "@/lib/collections";
import { getDb } from "@/lib/db";
import { ensureIndexes } from "@/lib/indexes";

export type AdminOverviewStats = {
  students: {
    total: number;
    thisWeek: number;
    verified: number;
    unverified: number;
    university: number;
    other: number;
  };
  enrollments: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  exams: {
    total: number;
    published: number;
    attempts: number;
    avgScore: number;
  };
  revenue: {
    totalBdt: number;
    thisMonthBdt: number;
    pendingBdt: number;
  };
  courses: {
    total: number;
    published: number;
    free: number;
    paid: number;
  };
};

export type RecentStudent = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  registeredAt: string;
};

export type PendingEnrollment = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  requestedAt: string;
};

export type TopPerformer = {
  attemptId: string;
  userId: string;
  examId: string;
  userName: string;
  examTitle: string;
  scorePercent: number;
  submittedAt: string;
};

export type ActivityPoint = {
  date: string;
  attempts: number;
  enrollments: number;
};

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  await ensureIndexes();

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    studentsTotal,
    studentsThisWeek,
    verifiedCount,
    unverifiedCount,
    universityCount,
    otherCount,
    enrollmentCounts,
    examCounts,
    revenueCounts,
    courseCounts,
  ] = await Promise.all([
    (await usersCol()).countDocuments({ role: "student" }),
    (await usersCol()).countDocuments({
      role: "student",
      createdAt: { $gte: weekStart },
    }),
    (await usersCol()).countDocuments({ role: "student", verified: true }),
    (await usersCol()).countDocuments({ role: "student", verified: false }),
    (await usersCol()).countDocuments({ role: "student", tier: "UNIVERSITY" }),
    (await usersCol()).countDocuments({ role: "student", tier: "OTHER" }),
    (async () => {
      const [total, pending, approved, rejected] = await Promise.all([
        (await enrollmentsCol()).countDocuments({}),
        (await enrollmentsCol()).countDocuments({ status: "pending" }),
        (await enrollmentsCol()).countDocuments({ status: "approved" }),
        (await enrollmentsCol()).countDocuments({ status: "rejected" }),
      ]);

      return { total, pending, approved, rejected };
    })(),
    (async () => {
      const [total, published, attemptRows, avgRows] = await Promise.all([
        (await examsCol()).countDocuments({}),
        (await examsCol()).countDocuments({ status: "published" }),
        (await examAttemptsCol()).countDocuments({
          status: { $in: ["submitted", "auto-submitted"] },
        }),
        (await examAttemptsCol())
          .aggregate([
            {
              $match: {
                status: { $in: ["submitted", "auto-submitted"] },
              },
            },
            {
              $lookup: {
                from: "exams",
                localField: "examId",
                foreignField: "_id",
                as: "exam",
              },
            },
            {
              $project: {
                percent: {
                  $cond: [
                    {
                      $gt: [
                        {
                          $ifNull: [{ $arrayElemAt: ["$exam.totalMarks", 0] }, 0],
                        },
                        0,
                      ],
                    },
                    {
                      $divide: [
                        "$score",
                        { $ifNull: [{ $arrayElemAt: ["$exam.totalMarks", 0] }, 1] },
                      ],
                    },
                    0,
                  ],
                },
              },
            },
            { $group: { _id: null, avgPercent: { $avg: "$percent" } } },
          ])
          .toArray(),
      ]);

      return {
        total,
        published,
        attempts: attemptRows,
        avgScore: Number(avgRows[0]?.avgPercent ?? 0) * 100,
      };
    })(),
    (async () => {
      const [total, monthTotal, pending] = await Promise.all([
        (await paymentsCol())
          .aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
          .toArray(),
        (await paymentsCol())
          .aggregate([
            {
              $match: {
                status: "completed",
                paidAt: { $gte: monthStart },
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
          .toArray(),
        (await paymentsCol())
          .aggregate([
            { $match: { status: "pending" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
          .toArray(),
      ]);

      return {
        totalBdt: Number(total[0]?.total ?? 0),
        thisMonthBdt: Number(monthTotal[0]?.total ?? 0),
        pendingBdt: Number(pending[0]?.total ?? 0),
      };
    })(),
    (async () => {
      const [total, published, free, paid] = await Promise.all([
        (await coursesCol()).countDocuments({}),
        (await coursesCol()).countDocuments({ status: "published" }),
        (await coursesCol()).countDocuments({ type: "free" }),
        (await coursesCol()).countDocuments({ type: "paid" }),
      ]);

      return { total, published, free, paid };
    })(),
  ]);

  return {
    students: {
      total: studentsTotal,
      thisWeek: studentsThisWeek,
      verified: verifiedCount,
      unverified: unverifiedCount,
      university: universityCount,
      other: otherCount,
    },
    enrollments: {
      total: enrollmentCounts.total,
      pending: enrollmentCounts.pending,
      approved: enrollmentCounts.approved,
      rejected: enrollmentCounts.rejected,
    },
    exams: {
      total: examCounts.total,
      published: examCounts.published,
      attempts: examCounts.attempts,
      avgScore: Number(examCounts.avgScore ?? 0),
    },
    revenue: {
      totalBdt: revenueCounts.totalBdt,
      thisMonthBdt: revenueCounts.thisMonthBdt,
      pendingBdt: revenueCounts.pendingBdt,
    },
    courses: {
      total: courseCounts.total,
      published: courseCounts.published,
      free: courseCounts.free,
      paid: courseCounts.paid,
    },
  };
}

export async function getRecentStudents(
  limit = 5,
): Promise<RecentStudent[]> {
  const users = await (await usersCol())
    .find({ role: "student" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    verified: Boolean(user.verified),
    registeredAt: (user.createdAt ?? new Date()).toISOString(),
  }));
}

export async function getPendingEnrollments(
  limit = 5,
): Promise<PendingEnrollment[]> {
  const pending = await (await enrollmentsCol())
    .find({ status: "pending" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  const userIds = pending.map((item) => item.userId);
  const courseIds = pending.map((item) => item.courseId);

  const [users, courses] = await Promise.all([
    (await usersCol()).find({ _id: { $in: userIds } }).toArray(),
    (await coursesCol()).find({ _id: { $in: courseIds } }).toArray(),
  ]);

  const userMap = new Map(users.map((user) => [user._id.toString(), user]));
  const courseMap = new Map(
    courses.map((course) => [course._id.toString(), course]),
  );

  return pending.map((item) => {
    const user = userMap.get(item.userId.toString());
    const course = courseMap.get(item.courseId.toString());

    return {
      id: item._id.toString(),
      userId: item.userId.toString(),
      userName: user?.name ?? "Unknown student",
      userEmail: user?.email ?? "unknown@example.com",
      courseId: item.courseId.toString(),
      courseTitle: course?.title ?? "Unknown course",
      requestedAt: (item.createdAt ?? new Date()).toISOString(),
    };
  });
}

export async function getTopPerformers(
  limit = 5,
): Promise<TopPerformer[]> {
  const attempts = await (await examAttemptsCol())
    .find({ status: { $in: ["submitted", "auto-submitted"] } })
    .sort({ submittedAt: -1, score: -1 })
    .limit(Math.max(10, limit * 10))
    .toArray();

  const userIds = [...new Set(attempts.map((attempt) => attempt.userId.toString()))];
  const examIds = [...new Set(attempts.map((attempt) => attempt.examId.toString()))];

  const [users, exams] = await Promise.all([
    (await usersCol()).find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } }).toArray(),
    (await examsCol()).find({ _id: { $in: examIds.map((id) => new ObjectId(id)) } }).toArray(),
  ]);

  const userMap = new Map(users.map((user) => [user._id.toString(), user]));
  const examMap = new Map(exams.map((exam) => [exam._id.toString(), exam]));

  const performers = attempts
    .map((attempt) => {
      const exam = examMap.get(attempt.examId.toString());
      const user = userMap.get(attempt.userId.toString());
      const scorePercent =
        exam && exam.totalMarks > 0 ? (attempt.score / exam.totalMarks) * 100 : 0;

      return {
        attemptId: attempt._id.toString(),
        userId: attempt.userId.toString(),
        userName: user?.name ?? "Unknown student",
        examId: attempt.examId.toString(),
        examTitle: exam?.title ?? "Unknown exam",
        scorePercent: Number(scorePercent || 0),
        submittedAt: (
          attempt.submittedAt ?? attempt.startedAt ?? new Date()
        ).toISOString(),
      };
    })
    .sort((left, right) => right.scorePercent - left.scorePercent)
    .slice(0, limit);

  return performers;
}

export async function getActivityTrend(
  days = 30,
): Promise<ActivityPoint[]> {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - Math.max(1, days - 1));
  start.setHours(0, 0, 0, 0);

  const dateKeys: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    dateKeys.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  const [attemptRows, enrollmentRows] = await Promise.all([
    (await examAttemptsCol())
      .find({
        status: { $in: ["submitted", "auto-submitted"] },
        createdAt: { $gte: start },
      })
      .project({ _id: 1, createdAt: 1, submittedAt: 1 })
      .toArray(),
    (await enrollmentsCol())
      .find({ createdAt: { $gte: start } })
      .project({ _id: 1, createdAt: 1 })
      .toArray(),
  ]);

  const attemptMap = new Map<string, number>();
  const enrollmentMap = new Map<string, number>();

  for (const row of attemptRows) {
    const dateKey = (row.submittedAt ?? row.createdAt ?? new Date())
      .toISOString()
      .slice(0, 10);
    attemptMap.set(dateKey, (attemptMap.get(dateKey) ?? 0) + 1);
  }

  for (const row of enrollmentRows) {
    const dateKey = (row.createdAt ?? new Date()).toISOString().slice(0, 10);
    enrollmentMap.set(dateKey, (enrollmentMap.get(dateKey) ?? 0) + 1);
  }

  return dateKeys.map((dateKey) => ({
    date: dateKey,
    attempts: attemptMap.get(dateKey) ?? 0,
    enrollments: enrollmentMap.get(dateKey) ?? 0,
  }));
}
