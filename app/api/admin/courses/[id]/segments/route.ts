import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { coursesCol } from "@/lib/collections";
import type { SubSegmentKind } from "@/lib/types/course";
import { withGuard } from "@/lib/route-guard";
import { segmentsUpdateSchema } from "@/lib/validators/course-content";

function normaliseScheduledAt(value?: string | Date) {
  if (!value) {
    return undefined;
  }

  return typeof value === "string" ? new Date(value) : value;
}

function normaliseSegment(segment: {
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
    kind: SubSegmentKind;
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
      payload: {
        ...subSegment.payload,
        scheduledAt: normaliseScheduledAt(
          subSegment.payload && "scheduledAt" in subSegment.payload
            ? (subSegment.payload.scheduledAt as string | Date | undefined)
            : undefined
        ),
      },
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

    return ok({ segments: course.segments ?? [] });
  } catch (error) {
    console.error("Get course segments error", error);
    return fail("Server error", 500);
  }
});

export const PUT = withGuard({ kind: "admin" }, async (req, { params }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const parsed = segmentsUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid course content payload.", 400);
    }

    const collection = await coursesCol();
    const existing = await collection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return fail("Course not found.", 404);
    }

    const nextSegments = parsed.data.segments.map((segment) =>
      normaliseSegment(segment)
    );

    const totalPrice =
      existing.type === "free"
        ? 0
        : nextSegments.reduce(
            (total, segment) => total + (segment.isFree ? 0 : segment.price),
            0
          );

    await collection.updateOne(
      { _id: existing._id },
      {
        $set: {
          segments: nextSegments,
          price: totalPrice,
          updatedAt: new Date(),
        },
      }
    );

    const refreshed = await collection.findOne({ _id: existing._id });
    return ok({ segments: refreshed?.segments ?? nextSegments });
  } catch (error) {
    console.error("Update course segments error", error);
    return fail("Server error", 500);
  }
});
