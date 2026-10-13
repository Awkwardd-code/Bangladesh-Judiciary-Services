import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { coursesCol } from "@/lib/collections";
import { withGuard } from "@/lib/route-guard";
import { courseCreateSchema } from "@/lib/validators/course";

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

    const courseType = data.type ?? "paid";
    const now = new Date();
    const course = {
      _id: new ObjectId(),
      ...data,
      type: courseType,
      price:
        courseType === "free"
          ? 0
          : data.programKind !== "exam" && data.segments.length > 0
            ? data.segments.reduce(
                (total, segment) =>
                  total + (segment.isFree ? 0 : segment.price),
                0
              )
            : Number(data.price || 0),
      totalMaterials: data.totalMaterials ?? 0,
      discountPercent: courseType === "free" ? undefined : data.discountPercent,
      segments: (data.segments ?? []).map((segment) =>
        normaliseSegmentInput(segment)
      ),
      routine: (data.routine ?? []).map((item) => ({
        ...item,
        scheduledAt: new Date(item.scheduledAt),
      })),
      topics: (data.topics ?? []).map((topic) => ({
        _id: new ObjectId(topic._id ?? new ObjectId()),
        title: topic.title,
        description: topic.description,
        order: topic.order,
        examIds: topic.examIds.map((examId) => new ObjectId(examId)),
      })),
      currency: "BDT" as const,
      mentorIds: (data.mentorIds ?? []).map(
        (mentorId) => new ObjectId(mentorId)
      ),
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
