import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import type { Exam } from "@/lib/types/exam";
import {
  coursesCol,
  examAttemptsCol,
  examsCol,
} from "@/lib/collections";
import { requireAdmin } from "@/lib/auth-guard";
import { buildPaginationMeta } from "@/lib/pagination";
import { examCreateSchema } from "@/lib/validators/exam";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  courseId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  category: z.enum(["BJS", "BAR", "LLB"]).optional(),
  kind: z.enum(["preliminary", "written"]).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().trim().max(200).optional(),
});

function serializeExam(exam: Exam | null) {
  if (!exam) {
    return null;
  }

  return {
    ...exam,
    _id: exam._id.toString(),
    courseId: exam.courseId.toString(),
    segmentId: exam.segmentId.toString(),
    subSegmentId: exam.subSegmentId.toString(),
    createdBy: exam.createdBy.toString(),
    scheduledAt: exam.scheduledAt?.toISOString() ?? null,
    closesAt: exam.closesAt?.toISOString() ?? null,
    createdAt: exam.createdAt.toISOString(),
    updatedAt: exam.updatedAt.toISOString(),
  };
}

type SegmentInput = {
  _id?: string;
  title: string;
  description: string;
  order: number;
  isFree: boolean;
  price: number;
  discountedPrice?: number;
  subSegments: Array<{
    _id?: string;
    title: string;
    description: string;
    order: number;
    levels: Array<{
      _id?: string;
      title: string;
      kind: "mcq" | "written";
      questionIds: Array<string | ObjectId>;
      durationMinutes: number;
      passMarkPercent: number;
      marks: number;
    }>;
  }>;
};

function normalizeSegments(segments: SegmentInput[]) {
  return segments.map((segment) => ({
    ...segment,
    _id: segment._id ? new ObjectId(segment._id) : new ObjectId(),
    subSegments: segment.subSegments.map((subSegment) => ({
      ...subSegment,
      _id: subSegment._id ? new ObjectId(subSegment._id) : new ObjectId(),
      levels: subSegment.levels.map((level) => ({
        ...level,
        _id: level._id ? new ObjectId(level._id) : new ObjectId(),
        questionIds: level.questionIds.map((questionId) =>
          questionId instanceof ObjectId ? questionId : new ObjectId(questionId),
        ),
      })),
    })),
  })) as Exam["segments"];
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    const parsedQuery = querySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );
    if (!parsedQuery.success) {
      return fail("Invalid query parameters.", 400);
    }

    const { page, limit, courseId, category, kind, status, search } =
      parsedQuery.data;
    const collection = await examsCol();
    const filter: Record<string, unknown> = {};

    if (courseId) {
      filter.courseId = new ObjectId(courseId);
    }
    if (kind) {
      filter.kind = kind;
    }
    if (status) {
      filter.status = status;
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    if (category) {
      const matchingCourses = await (await coursesCol())
        .find({ category }, { projection: { _id: 1 } })
        .toArray();
      filter.courseId = {
        $in: matchingCourses.map((course) => course._id),
      };
    }

    const [records, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    const courseIds = [...new Set(records.map((exam) => exam.courseId.toString()))]
      .map((id) => new ObjectId(id));
    const courseRecords =
      courseIds.length > 0
        ? await (await coursesCol()).find({ _id: { $in: courseIds } }).toArray()
        : [];
    const courseById = new Map(
      courseRecords.map((course) => [course._id.toString(), course]),
    );

    const exams = await Promise.all(
      records.map(async (exam) => {
        const course = courseById.get(exam.courseId.toString());
        const segment = course?.segments?.find(
          (item) => item._id.toString() === exam.segmentId.toString(),
        );
        const subSegment = segment?.subSegments.find(
          (item) => item._id.toString() === exam.subSegmentId.toString(),
        );

        return {
          ...serializeExam(exam),
          courseTitle: course?.title ?? "Unknown course",
          courseSlug: course?.slug,
          courseCategory: course?.category ?? null,
          segmentTitle: segment?.title ?? "Unknown module",
          subSegmentTitle: subSegment?.title ?? "Unknown content",
          attemptCount: await (await examAttemptsCol()).countDocuments({
            examId: exam._id,
          }),
        };
      }),
    );

    return ok({
      exams,
      pagination: buildPaginationMeta({ page, limit }, total),
    });
  } catch (error) {
    console.error("List admin exams error", error);
    return fail("Server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    const parsed = examCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid exam payload.", 400);
    }

    const data = parsed.data;
    const courseId = new ObjectId(data.courseId);
    const course = await (await coursesCol()).findOne({ _id: courseId });
    if (!course) {
      return fail("Course not found.", 404);
    }

    const segment = course.segments?.find(
      (item) => item._id.toString() === data.segmentId,
    );
    if (!segment) {
      return fail("Course module not found.", 404);
    }

    const subSegment = segment.subSegments.find(
      (item) => item._id.toString() === data.subSegmentId,
    );
    if (!subSegment) {
      return fail("Course content item not found.", 404);
    }

    const now = new Date();
    const exam: Exam = {
      _id: new ObjectId(),
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl,
      thumbnailPublicId: data.thumbnailPublicId,
      courseId,
      segmentId: new ObjectId(data.segmentId),
      subSegmentId: new ObjectId(data.subSegmentId),
      kind: data.kind,
      type: data.type ?? "paid",
      price: data.price ?? 0,
      discountedPrice: data.discountedPrice,
      validityMonths: data.validityMonths ?? 12,
      discountTill: data.discountTill ? new Date(data.discountTill) : undefined,
      purchaseMode: data.purchaseMode ?? "complete",
      durationMinutes: data.durationMinutes,
      passMarkPercent: data.passMarkPercent,
      negativeMarking: data.negativeMarking,
      questionsPerAttempt: data.questionsPerAttempt,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      closesAt: data.closesAt ? new Date(data.closesAt) : undefined,
      totalQuestions: 0,
      totalMarks: 0,
      status: data.status ?? "draft",
      order: data.order,
      createdBy: new ObjectId(session.userId),
      segments: normalizeSegments(data.segments ?? []),
      createdAt: now,
      updatedAt: now,
    };

    await (await examsCol()).insertOne(exam);
    return ok({ exam: serializeExam(exam) }, 201);
  } catch (error) {
    console.error("Create admin exam error", error);
    return fail("Server error", 500);
  }
}
