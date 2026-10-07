import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { coursesCol } from "@/lib/collections";
import { withGuard } from "@/lib/route-guard";
import { courseCreateSchema } from "@/lib/validators/course";

export const GET = withGuard({ kind: "admin" }, async (req) => {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() ?? "";
    const category = url.searchParams.get("category")?.trim();
    const status = url.searchParams.get("status")?.trim();

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    const collection = await coursesCol();
    const courses = await collection
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    return ok({
      courses: courses.map((course) => ({
        ...course,
        id: course._id.toString(),
      })),
      pagination: {
        page: 1,
        limit: courses.length,
        total: courses.length,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error("List admin courses error", error);
    return fail("Server error", 500);
  }
});

export const POST = withGuard({ kind: "admin" }, async (req, { session }) => {
  try {
    const body = await req.json();
    const parsed = courseCreateSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid course payload.", 400);
    }

    const data = parsed.data;
    const collection = await coursesCol();

    const existing = await collection.findOne({ slug: data.slug });

    if (existing) {
      return fail("A course with this slug already exists.", 409);
    }

    const now = new Date();
    const course = {
      _id: new ObjectId(),
      ...data,
      currency: "BDT" as const,
      mentorIds: (data.mentorIds ?? []).map((mentorId) => new ObjectId(mentorId)),
      createdAt: now,
      updatedAt: now,
      createdBy: new ObjectId(session!.userId),
    };

    await collection.insertOne(course);

    return ok({ course: { ...course, id: course._id.toString() } }, 201);
  } catch (error) {
    console.error("Create course error", error);
    return fail("Server error", 500);
  }
});
