import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  preliminaryAttemptsCol,
  preliminaryExamsCol,
  usersCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    await ensureIndexes();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Exam not found", 404);
    }

    const examId = new ObjectId(id);
    const exam = await (await preliminaryExamsCol()).findOne({ _id: examId });

    if (!exam) {
      return fail("Exam not found", 404);
    }

    const attempts = await (
      await preliminaryAttemptsCol()
    )
      .find({ examId })
      .sort({ submittedAt: -1, startedAt: -1 })
      .limit(100)
      .toArray();
    const userIds = Array.from(
      new Set(attempts.map((attempt) => attempt.userId.toString()))
    ).map((userId) => new ObjectId(userId));
    const users =
      userIds.length > 0
        ? await (
            await usersCol()
          )
            .find({ _id: { $in: userIds } })
            .project({ name: 1, email: 1 })
            .toArray()
        : [];
    const userMap = new Map(
      users.map((user) => [
        user._id.toString(),
        { name: user.name, email: user.email },
      ])
    );

    return ok({
      attempts: attempts.map((attempt) => ({
        id: attempt._id.toString(),
        status: attempt.status,
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        score: attempt.score,
        maxScore: exam.totalMarks,
        user: userMap.get(attempt.userId.toString()) ?? null,
      })),
    });
  } catch (error) {
    console.error("Get preliminary exam attempts error", error);
    return fail("Server error", 500);
  }
}
