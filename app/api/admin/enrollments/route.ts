import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { coursesCol, enrollmentsCol, usersCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";
import type { CourseCategory } from "@/lib/types/course";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    await ensureIndexes();

    const params = new URL(req.url).searchParams;
    const { page, limit } = parsePagination(params);
    const status = params.get("status")?.trim();
    const courseId = params.get("courseId")?.trim();
    const courseCategory = params.get("course")?.trim();
    const userId = params.get("userId")?.trim();
    const search = params.get("search")?.trim();
    const isPaid = params.get("isPaid");
    const filter: Record<string, unknown> = {};

    if (status && ["pending", "approved", "rejected", "revoked"].includes(status)) {
      filter.status = status;
    }

    if (courseId && ObjectId.isValid(courseId)) {
      filter.courseId = new ObjectId(courseId);
    }

    if (userId && ObjectId.isValid(userId)) {
      filter.userId = new ObjectId(userId);
    }

    if (isPaid === "true" || isPaid === "false") {
      filter.isPaid = isPaid === "true";
    }

    if (
      courseCategory &&
      ["preliminary", "written", "viva", "foundation"].includes(courseCategory)
    ) {
      const matchingCourses = await (await coursesCol())
        .find(
          { category: courseCategory as CourseCategory },
          { projection: { _id: 1 } },
        )
        .toArray();
      filter.courseId = { $in: matchingCourses.map((course) => course._id) };
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const expression = new RegExp(escaped, "i");
      const [matchingUsers, matchingCourses] = await Promise.all([
        (await usersCol())
          .find({ $or: [{ name: expression }, { email: expression }] })
          .project({ _id: 1 })
          .toArray(),
        (await coursesCol())
          .find({ title: expression })
          .project({ _id: 1 })
          .toArray(),
      ]);
      const userIds = matchingUsers.map((user) => user._id);
      const courseIds = matchingCourses.map((course) => course._id);
      const alternatives = [
        ...(userIds.length ? [{ userId: { $in: userIds } }] : []),
        ...(courseIds.length ? [{ courseId: { $in: courseIds } }] : []),
      ];
      if (alternatives.length) {
        filter.$or = alternatives;
      } else {
        filter._id = { $exists: false };
      }
    }

    const collection = await enrollmentsCol();
    const [items, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    const userIds = [...new Set(items.map((item) => item.userId.toString()))];
    const courseIds = [...new Set(items.map((item) => item.courseId.toString()))];

    const [userList, courseList] = await Promise.all([
      userIds.length
        ? (await usersCol())
            .find({ _id: { $in: userIds.map((value) => new ObjectId(value)) } })
            .toArray()
        : Promise.resolve([]),
      courseIds.length
        ? (await coursesCol())
            .find({ _id: { $in: courseIds.map((value) => new ObjectId(value)) } })
            .toArray()
        : Promise.resolve([]),
    ]);

    const userMap = new Map(
      userList.map((user) => [user._id.toString(), { name: user.name, email: user.email }]),
    );
    const courseMap = new Map(
      courseList.map((course) => [course._id.toString(), { title: course.title, price: course.price }]),
    );

    const enrollments = items.map((item) => {
      const user = userMap.get(item.userId.toString());
      const course = courseMap.get(item.courseId.toString());

      return {
        id: item._id.toString(),
        userId: item.userId.toString(),
        courseId: item.courseId.toString(),
        status: item.status,
        isPaid: item.isPaid,
        approvedAt: item.approvedAt ?? null,
        createdAt: item.createdAt,
        user: {
          id: item.userId.toString(),
          name: user?.name ?? "Unknown student",
          email: user?.email ?? "",
        },
        course: {
          id: item.courseId.toString(),
          title: course?.title ?? "Unknown course",
          price: course?.price ?? 0,
        },
      };
    });

    return ok({
      enrollments,
      pagination: buildPaginationMeta({ page, limit }, total),
    });
  } catch (error) {
    console.error("List enrollments error", error);
    return fail("Server error", 500);
  }
}
