import { ObjectId, type Filter } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  usersCol,
  writtenExamsCol,
  writtenSubmissionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";
import type { WrittenSubmission } from "@/lib/types/exam";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    await ensureIndexes();
    const params = new URL(req.url).searchParams;
    const { page, limit } = parsePagination(params);
    const filter: Filter<WrittenSubmission> = {};
    const examId = params.get("examId");
    const status = params.get("status");
    const pendingOnly = params.get("pendingOnly") === "true";
    const search = params.get("search")?.trim();

    if (examId) {
      if (!ObjectId.isValid(examId)) {
        return fail("Invalid exam ID", 400);
      }

      filter.examId = new ObjectId(examId);
    }

    if (pendingOnly) {
      filter.status = { $in: ["submitted", "under-review"] };
    } else if (
      status &&
      ["submitted", "under-review", "graded"].includes(status)
    ) {
      filter.status = status as WrittenSubmission["status"];
    }

    if (search) {
      const expression = new RegExp(escapeRegex(search), "i");
      const matchingUsers = await (
        await usersCol()
      )
        .find(
          { $or: [{ name: expression }, { email: expression }] },
          { projection: { _id: 1 } },
        )
        .limit(1000)
        .toArray();
      filter.userId = { $in: matchingUsers.map((user) => user._id) };
    }

    const collection = await writtenSubmissionsCol();
    const [records, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ submittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);
    const userIds = [
      ...new Set(records.map((record) => record.userId.toString())),
    ].map((id) => new ObjectId(id));
    const examIds = [
      ...new Set(records.map((record) => record.examId.toString())),
    ].map((id) => new ObjectId(id));
    const [users, exams] = await Promise.all([
      userIds.length
        ? (await usersCol()).find({ _id: { $in: userIds } }).toArray()
        : [],
      examIds.length
        ? (await writtenExamsCol()).find({ _id: { $in: examIds } }).toArray()
        : [],
    ]);
    const userById = new Map(users.map((user) => [user._id.toString(), user]));
    const examById = new Map(exams.map((exam) => [exam._id.toString(), exam]));

    const submissions = records.map((record) => {
      const user = userById.get(record.userId.toString());
      const exam = examById.get(record.examId.toString());

      return {
        id: record._id.toString(),
        examId: record.examId.toString(),
        userId: record.userId.toString(),
        submittedAt: record.submittedAt,
        status: record.status,
        totalScore: record.totalScore,
        maxScore: record.maxScore,
        user: user
          ? { id: user._id.toString(), name: user.name, email: user.email }
          : null,
        exam: exam
          ? {
              id: exam._id.toString(),
              title: exam.title,
              totalMarks: exam.totalMarks,
            }
          : null,
      };
    });

    return ok({
      submissions,
      pagination: buildPaginationMeta({ page, limit }, total),
    });
  } catch (error) {
    console.error("List written submissions error", error);
    return fail("Server error", 500);
  }
}
