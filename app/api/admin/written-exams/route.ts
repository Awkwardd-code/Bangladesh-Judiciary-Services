import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { writtenExamsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";
import { writtenExamCreateSchema } from "@/lib/validators/admin";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    await ensureIndexes();
    const params = new URL(req.url).searchParams;
    const { page, limit } = parsePagination(params);
    const requestedStatus = params.get("status");
    const filter =
      requestedStatus &&
      ["draft", "published", "archived"].includes(requestedStatus)
        ? { status: requestedStatus as "draft" | "published" | "archived" }
        : {};
    const collection = await writtenExamsCol();
    const [exams, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return ok({
      exams,
      pagination: buildPaginationMeta({ page, limit }, total),
    });
  } catch (error) {
    console.error("List written exams error", error);
    return fail("Server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return fail("Invalid request body", 400);
    }

    const parsed = writtenExamCreateSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Invalid written exam",
        400,
      );
    }

    await ensureIndexes();
    const now = new Date();
    const exam = {
      _id: new ObjectId(),
      ...parsed.data,
      questionsPerAttempt: parsed.data.questionsPerAttempt ?? 0,
      scheduledAt: parsed.data.scheduledAt
        ? new Date(parsed.data.scheduledAt)
        : undefined,
      closesAt: parsed.data.closesAt
        ? new Date(parsed.data.closesAt)
        : undefined,
      status: "draft" as const,
      totalQuestions: 0,
      totalMarks: 0,
      createdBy: new ObjectId(session.userId),
      createdAt: now,
      updatedAt: now,
    };
    await (await writtenExamsCol()).insertOne(exam);

    return ok({ exam }, 201);
  } catch (error) {
    console.error("Create written exam error", error);
    return fail("Server error", 500);
  }
}
