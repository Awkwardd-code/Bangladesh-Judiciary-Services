import { ensureIndexes } from "@/lib/indexes";
import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  preliminaryQuestionsCol,
  writtenQuestionsCol,
} from "@/lib/collections";

export async function GET() {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    await ensureIndexes();

    const [preliminary, written] = await Promise.all([
      (await preliminaryQuestionsCol())
        .find({})
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray(),
      (await writtenQuestionsCol())
        .find({})
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray(),
    ]);

    const questions = [
      ...preliminary.map((question) => ({
        _id: question._id.toString(),
        kind: "preliminary",
        sourceCollection: "preliminary_questions",
        examId: question.examId.toString(),
        questionText: question.questionText,
        subject: question.subject ?? "General",
        marks: question.marks,
        order: question.order,
        createdAt: question.createdAt,
      })),
      ...written.map((question) => ({
        _id: question._id.toString(),
        kind: "written",
        sourceCollection: "written_questions",
        examId: question.examId.toString(),
        questionText: question.questionText,
        subject: question.subject ?? "General",
        marks: question.maxMarks,
        order: question.order,
        createdAt: question.createdAt,
      })),
    ].sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      return rightTime - leftTime;
    });

    const pagination = {
      page: 1,
      perPage: 200,
      total: questions.length,
    };

    const facets = {
      kinds: ["preliminary", "written"],
      subjects: Array.from(
        new Set(questions.map((question) => question.subject)),
      ).sort((left, right) => left.localeCompare(right)),
    };

    return ok({ questions, pagination, facets });
  } catch (error) {
    console.error("List question bank error", error);
    return fail("Server error", 500);
  }
}
