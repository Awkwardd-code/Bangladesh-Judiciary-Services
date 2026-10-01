import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { enrollmentsCol, paymentsCol, usersCol } from "@/lib/collections";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Invalid user id", 400);
    }

    const userId = new ObjectId(id);
    const collection = await usersCol();
    const user = await collection.findOne({ _id: userId });

    if (!user) {
      return fail("User not found", 404);
    }

    const enrollments = await (await enrollmentsCol())
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const courseIds = [...new Set(enrollments.map((item) => item.courseId.toString()))];
    const courseMap = new Map<string, string>();

    if (courseIds.length > 0) {
      const courses = await (await (await import("@/lib/collections")).coursesCol())
        .find({ _id: { $in: courseIds.map((value) => new ObjectId(value)) } })
        .toArray();

      for (const course of courses) {
        courseMap.set(course._id.toString(), course.title);
      }
    }

    const paymentTotal = await (await paymentsCol())
      .aggregate([
        { $match: { userId, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray();

    const totalSpent = paymentTotal[0]?.total ?? 0;

    return ok({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        verified: user.verified,
        approved: user.approved,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      enrollments: enrollments.map((item) => ({
        courseId: item.courseId.toString(),
        courseTitle: courseMap.get(item.courseId.toString()) ?? "Unknown course",
        status: item.status,
        isPaid: item.isPaid,
        approvedAt: item.approvedAt ?? null,
      })),
      stats: {
        totalEnrollments: enrollments.length,
        approvedEnrollments: enrollments.filter((item) => item.status === "approved").length,
        pendingEnrollments: enrollments.filter((item) => item.status === "pending").length,
        totalSpent,
      },
    });
  } catch (error) {
    console.error("Get user detail error", error);
    return fail("Server error", 500);
  }
}
