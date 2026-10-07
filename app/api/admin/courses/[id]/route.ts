import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { coursesCol, enrollmentsCol, materialsCol } from "@/lib/collections";
import { withGuard } from "@/lib/route-guard";
import { courseUpdateSchema } from "@/lib/validators/course";

export const GET = withGuard({ kind: "admin" }, async (_req, { params }) => {
  try {
    const { id } = params;
    const course = await (await coursesCol()).findOne({ _id: new ObjectId(id) });

    if (!course) {
      return fail("Course not found.", 404);
    }

    return ok({
      course: {
        ...course,
        id: course._id.toString(),
      },
    });
  } catch (error) {
    console.error("Get admin course error", error);
    return fail("Server error", 500);
  }
});

export const PATCH = withGuard({ kind: "admin" }, async (req, { params }) => {
  try {
    const { id } = params;
    const updateBody = await req.json();
    const parsed = courseUpdateSchema.safeParse(updateBody);

    if (!parsed.success) {
      return fail("Invalid course update payload.", 400);
    }

    const collection = await coursesCol();
    const existing = await collection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return fail("Course not found.", 404);
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const conflict = await collection.findOne({ slug: parsed.data.slug });
      if (conflict) {
        return fail("A course with this slug already exists.", 409);
      }
    }

    const update = {
      ...parsed.data,
      mentorIds: parsed.data.mentorIds
        ? parsed.data.mentorIds.map((mentorId) => new ObjectId(mentorId))
        : existing.mentorIds,
      updatedAt: new Date(),
    };

    await collection.updateOne({ _id: existing._id }, { $set: update });

    const course = await collection.findOne({ _id: existing._id });

    return ok({
      course: {
        ...course,
        id: course!._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update course error", error);
    return fail("Server error", 500);
  }
});

export const DELETE = withGuard({ kind: "admin" }, async (_req, { params }) => {
  try {
    const { id } = params;
    const collection = await coursesCol();
    const course = await collection.findOne({ _id: new ObjectId(id) });

    if (!course) {
      return fail("Course not found.", 404);
    }

    await Promise.all([
      collection.deleteOne({ _id: course._id }),
      (await materialsCol()).deleteMany({ courseId: course._id }),
      (await enrollmentsCol()).updateMany(
        { courseId: course._id },
        { $set: { status: "revoked", updatedAt: new Date() } },
      ),
    ]);

    return ok({ message: "Course deleted." });
  } catch (error) {
    console.error("Delete course error", error);
    return fail("Server error", 500);
  }
});
