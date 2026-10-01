import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { preliminaryExamsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";
import { preliminaryExamCreateSchema } from "@/lib/validators/admin";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    await ensureIndexes();
    const params = new URL(req.url).searchParams;
    const { page, limit } = parsePagination(params);
    const status = params.get("status");
    const filter =
      status && ["draft", "published", "archived"].includes(status)
        ? { status: status as "draft" | "published" | "archived" }
        : {};
    const collection = await preliminaryExamsCol();
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
    console.error("List preliminary exams error", error);
    return fail("Server error", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    const parsed = preliminaryExamCreateSchema.safeParse(await req.json());
    if (!parsed.success)
      return fail(parsed.error.issues[0]?.message ?? "Invalid exam", 400);
    const now = new Date();
    const exam = {
      _id: new ObjectId(),
      ...parsed.data,
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
    await (await preliminaryExamsCol()).insertOne(exam);
    return ok({ exam }, 201);
  } catch (error) {
    console.error("Create preliminary exam error", error);
    return fail("Server error", 500);
  }
}
