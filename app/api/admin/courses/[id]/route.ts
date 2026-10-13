import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { coursesCol, enrollmentsCol, materialsCol } from "@/lib/collections";
import { withGuard } from "@/lib/route-guard";
import { courseUpdateSchema } from "@/lib/validators/course";

function normaliseSegmentInput(segment: {
  _id?: string;
  title: string;
  description?: string;
  order?: number;
  isFree?: boolean;
  price?: number;
  discountedPrice?: number;
  examIds?: string[];
  subSegments?: Array<{
    _id?: string;
    title: string;
    description?: string;
    order?: number;
    kind: "lecture" | "video" | "live" | "note" | "material";
    isFree?: boolean;
    examIds?: string[];
    payload?: Record<string, unknown>;
  }>;
}) {
  return {
    ...segment,
    _id: segment._id ? new ObjectId(segment._id) : new ObjectId(),
    description: segment.description ?? "",
    order: segment.order ?? 0,
    isFree: Boolean(segment.isFree),
    price: segment.price ?? 0,
    examIds: (segment.examIds ?? []).map((examId) => new ObjectId(examId)),
    subSegments: (segment.subSegments ?? []).map((subSegment) => ({
      ...subSegment,
      _id: subSegment._id ? new ObjectId(subSegment._id) : new ObjectId(),
      description: subSegment.description ?? "",
      order: subSegment.order ?? 0,
      isFree: Boolean(subSegment.isFree),
      examIds: (subSegment.examIds ?? []).map((examId) => new ObjectId(examId)),
      payload: { ...subSegment.payload },
    })),
  };
}

export const GET = withGuard({ kind: "admin" }, async (_req, { params }) => {
  try {
    const { id } = params;
    const course = await (
      await coursesCol()
    ).findOne({ _id: new ObjectId(id) });

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

    const nextType = parsed.data.type ?? existing.type ?? "paid";
    const nextProgramKind =
      parsed.data.programKind ?? existing.programKind ?? "course";
    const nextPrice =
      nextProgramKind !== "exam" &&
      parsed.data.segments !== undefined &&
      parsed.data.segments.length > 0
        ? parsed.data.segments.reduce(
            (total, segment) => total + (segment.isFree ? 0 : segment.price),
            0
          )
        : parsed.data.price !== undefined
          ? Number(parsed.data.price)
          : existing.price;

    if (nextType === "free") {
      parsed.data.price = 0;
      parsed.data.discountPercent = undefined;
    }

    if (
      nextType === "paid" &&
      nextPrice <= 0 &&
      (nextProgramKind === "exam" ||
        !parsed.data.segments ||
        parsed.data.segments.length === 0)
    ) {
      return fail("Paid courses must have a price greater than 0.", 400);
    }

    const nextTopics = parsed.data.topics
      ? parsed.data.topics.map((topic) => ({
          _id: topic._id ? new ObjectId(topic._id) : new ObjectId(),
          title: topic.title,
          description: topic.description,
          order: topic.order,
          examIds: topic.examIds.map((examId) => new ObjectId(examId)),
        }))
      : (existing.topics ?? []);

    const nextRoutine = parsed.data.routine
      ? parsed.data.routine.map((item) => ({
          ...item,
          scheduledAt: new Date(item.scheduledAt),
        }))
      : (existing.routine ?? []);

    const nextSegments = parsed.data.segments
      ? parsed.data.segments.map((segment) => normaliseSegmentInput(segment))
      : (existing.segments ?? []);

    const update = {
      ...parsed.data,
      type: nextType,
      price: nextType === "free" ? 0 : nextPrice,
      discountPercent:
        nextType === "free" ? undefined : parsed.data.discountPercent,
      segments: nextSegments,
      topics: nextTopics,
      routine: nextRoutine,
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
        { $set: { status: "revoked", updatedAt: new Date() } }
      ),
    ]);

    return ok({ message: "Course deleted." });
  } catch (error) {
    console.error("Delete course error", error);
    return fail("Server error", 500);
  }
});
