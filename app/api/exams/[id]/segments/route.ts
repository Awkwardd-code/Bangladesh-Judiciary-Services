import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { ok, fail } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { examsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { examSegmentsUpdateSchema } from "@/lib/validators/exam";
import type { ExamSegment } from "@/lib/types/exam";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Unauthorized", 401);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Invalid exam id", 400);
    }

    await ensureIndexes();

    const col = await examsCol();
    const exam = await col.findOne({
      _id: new ObjectId(id),
    });

    if (!exam) {
      return fail("Exam not found", 404);
    }

    return ok({ segments: exam.segments ?? [] });
  } catch (err) {
    console.error("[exams/segments]", err);
    return fail("Server error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Unauthorized", 401);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Invalid exam id", 400);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return fail("Invalid JSON body", 400);
    }

    const parsed = examSegmentsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return fail(
        first?.message ?? "Invalid segments payload",
        400,
      );
    }

    await ensureIndexes();

    const col = await examsCol();
    const exam = await col.findOne({
      _id: new ObjectId(id),
    });

    if (!exam) {
      return fail("Exam not found", 404);
    }

    const normalised: ExamSegment[] = parsed.data.segments.map(
      (segment) => ({
        ...segment,
        _id: segment._id ? new ObjectId(segment._id) : new ObjectId(),
        subSegments: segment.subSegments.map((sub) => ({
          ...sub,
          _id: sub._id ? new ObjectId(sub._id) : new ObjectId(),
          levels: sub.levels.map((level) => ({
            ...level,
            _id: level._id ? new ObjectId(level._id) : new ObjectId(),
            questionIds: level.questionIds.map((q) => new ObjectId(q)),
          })),
        })),
      }),
    );

    let totalQuestions = 0;
    const seen = new Set<string>();
    for (const seg of normalised) {
      for (const sub of seg.subSegments) {
        for (const level of sub.levels) {
          for (const q of level.questionIds) {
            seen.add(q.toString());
          }
        }
      }
    }
    totalQuestions = seen.size;

    let totalMarks = 0;
    for (const seg of normalised) {
      for (const sub of seg.subSegments) {
        for (const level of sub.levels) {
          totalMarks += level.marks;
        }
      }
    }

    await col.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          segments: normalised,
          totalQuestions,
          totalMarks,
          updatedAt: new Date(),
        },
      },
    );

    return ok({
      segments: normalised,
      totalQuestions,
      totalMarks,
    });
  } catch (err) {
    console.error("[exams/segments]", err);
    return fail("Server error", 500);
  }
}