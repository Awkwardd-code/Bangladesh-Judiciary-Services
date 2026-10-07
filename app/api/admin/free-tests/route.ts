import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { freeTestsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { freeTestCreateSchema } from "@/lib/validators/free-test";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);

  try {
    await ensureIndexes();
    const tests = await (
      await freeTestsCol()
    )
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return ok({ tests });
  } catch (error) {
    console.error("List free tests error", error);
    return fail("Server error", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);

  try {
    const body = await req.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";

    if (title.length < 3) {
      return fail("Title is required.", 400);
    }

    const parsed = freeTestCreateSchema.safeParse({
      ...body,
      title,
      questionsPerAttempt: body.questionsPerAttempt ?? 0,
      writtenQuestionsPerAttempt: body.writtenQuestionsPerAttempt ?? 0,
    });

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid free test", 400);
    }

    const now = new Date();
    const hasExplicitPhaseDurations =
      Object.prototype.hasOwnProperty.call(
        body,
        "preliminaryDurationMinutes"
      ) || Object.prototype.hasOwnProperty.call(body, "writtenDurationMinutes");
    const preliminaryDurationMinutes = hasExplicitPhaseDurations
      ? parsed.data.preliminaryDurationMinutes
      : (parsed.data.durationMinutes ?? 0);
    const writtenDurationMinutes = hasExplicitPhaseDurations
      ? parsed.data.writtenDurationMinutes
      : 0;
    const exam = {
      _id: new ObjectId(),
      ...parsed.data,
      preliminaryDurationMinutes: hasExplicitPhaseDurations
        ? preliminaryDurationMinutes
        : undefined,
      writtenDurationMinutes: hasExplicitPhaseDurations
        ? writtenDurationMinutes
        : undefined,
      durationMinutes: preliminaryDurationMinutes + writtenDurationMinutes,
      scheduledAt: parsed.data.scheduledAt
        ? new Date(parsed.data.scheduledAt)
        : undefined,
      closesAt: parsed.data.closesAt
        ? new Date(parsed.data.closesAt)
        : undefined,
      status: "draft" as const,
      questions: [],
      totalQuestions: 0,
      totalMarks: 0,
      createdBy: new ObjectId(session.userId),
      createdAt: now,
      updatedAt: now,
    };

    await (await freeTestsCol()).insertOne(exam);
    return ok({ exam }, 201);
  } catch (error) {
    console.error("Create free test error", error);
    return fail("Server error", 500);
  }
}
