import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { examAttemptsCol, examsCol, usersCol } from "@/lib/collections";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Forbidden", 403);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam not found.", 404);
    }

    const examId = new ObjectId(id);
    const exam = await (await examsCol()).findOne({ _id: examId });
    if (!exam) {
      return fail("Exam not found.", 404);
    }

    const attempts = await (await examAttemptsCol())
      .find({ examId })
      .sort({ submittedAt: -1, createdAt: -1 })
      .toArray();
    const users = await (await usersCol())
      .find(
        { _id: { $in: [...new Set(attempts.map((attempt) => attempt.userId))] } },
        { projection: { name: 1, email: 1 } },
      )
      .toArray();
    const usersById = new Map(
      users.map((user) => [user._id.toString(), user]),
    );

    return ok({
      attempts: attempts.map((attempt) => ({
        id: attempt._id.toString(),
        status: attempt.status,
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        score: attempt.score,
        maxScore: exam.totalMarks,
        user: usersById.get(attempt.userId.toString())
          ? {
              name: usersById.get(attempt.userId.toString())!.name,
              email: usersById.get(attempt.userId.toString())!.email,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("List admin exam attempts error", error);
    return fail("Server error", 500);
  }
}
