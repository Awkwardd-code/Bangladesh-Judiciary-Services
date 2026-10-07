import { ObjectId } from "mongodb";

import {
  coursesCol,
  freeTestsCol,
  preliminaryExamsCol,
  writtenExamsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta, type PaginationMeta } from "@/lib/pagination";

export type UnifiedExamCard = {
  id: string;
  kind: "preliminary" | "written" | "free";
  status: "published";
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  questionsPerAttempt: number;
  passMarkPercent?: number;
  isFree: boolean;
  price: number;
  courseId: string | null;
  courseTitle: string | null;
  courseSlug: string | null;
  scheduledAt: Date | null;
  closesAt: Date | null;
};

export type ExamListFilters = {
  search?: string;
  scope?: "all" | "free" | "paid";
  kind?: "all" | "preliminary" | "written" | "free";
  page: number;
  limit: number;
};

export async function listUnifiedExams(filters: ExamListFilters): Promise<{
  exams: UnifiedExamCard[];
  pagination: PaginationMeta;
}> {
  await ensureIndexes();

  const search = (filters.search ?? "").trim();
  const scope = filters.scope ?? "all";
  const page = Math.max(1, Number(filters.page ?? 1) || 1);
  const limit = Math.max(1, Number(filters.limit ?? 12) || 12);

  const [freeTests, preliminaryExams, writtenExams] = await Promise.all([
    (await freeTestsCol())
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .toArray(),
    (await preliminaryExamsCol())
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .toArray(),
    (await writtenExamsCol())
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .toArray(),
  ]);

  const courseIds = new Set<string>();

  for (const exam of [...preliminaryExams, ...writtenExams]) {
    const courseId = (exam as any).courseId;
    if (courseId) {
      courseIds.add(courseId.toString());
    }
  }

  const courseMap = new Map<
    string,
    { _id: ObjectId; title: string; slug: string; price: number }
  >();

  if (courseIds.size > 0) {
    const courses = await (
      await coursesCol()
    )
      .find({
        _id: { $in: Array.from(courseIds).map((id) => new ObjectId(id)) },
      })
      .toArray();

    for (const course of courses) {
      courseMap.set(course._id.toString(), {
        _id: course._id,
        title: course.title,
        slug: course.slug,
        price: course.price ?? 0,
      });
    }
  }

  const buildExam = (
    item: {
      _id: ObjectId;
      title: string;
      description?: string;
      durationMinutes: number;
      totalQuestions?: number;
      totalMarks?: number;
      questionsPerAttempt?: number;
      writtenQuestionsPerAttempt?: number;
      questions?: Array<{
        sourceCollection: "preliminary_questions" | "written_questions";
      }>;
      passMarkPercent?: number;
      scheduledAt?: Date;
      closesAt?: Date;
      courseId?: ObjectId;
      createdAt?: Date;
    },
    kind: "preliminary" | "written" | "free",
    isFree: boolean,
    price: number
  ): UnifiedExamCard => {
    const courseId = item.courseId?.toString() ?? null;
    const courseInfo = courseId ? (courseMap.get(courseId) ?? null) : null;

    const totalQuestions = Number(item.totalQuestions ?? 0);
    let questionsPerAttempt = Number(
      kind === "free"
        ? (item.questionsPerAttempt ?? 0)
        : (item.questionsPerAttempt ?? item.totalQuestions ?? 0)
    );

    if (kind === "free" && Array.isArray(item.questions)) {
      const preliminaryCount = item.questions.filter(
        (question) => question.sourceCollection === "preliminary_questions"
      ).length;
      const writtenCount = item.questions.filter(
        (question) => question.sourceCollection === "written_questions"
      ).length;
      const preliminaryServed =
        preliminaryCount === 0
          ? 0
          : questionsPerAttempt > 0
            ? Math.min(questionsPerAttempt, preliminaryCount)
            : preliminaryCount;
      const writtenTarget = item.writtenQuestionsPerAttempt ?? 0;
      const writtenServed =
        writtenCount === 0
          ? 0
          : writtenTarget > 0
            ? Math.min(writtenTarget, writtenCount)
            : writtenCount;
      const totalServed = preliminaryServed + writtenServed;

      questionsPerAttempt = totalServed >= totalQuestions ? 0 : totalServed;
    }

    return {
      id: item._id.toString(),
      kind,
      status: "published",
      title: item.title,
      description: item.description ?? "",
      durationMinutes: Number(item.durationMinutes ?? 0),
      totalQuestions,
      totalMarks: Number(item.totalMarks ?? 0),
      questionsPerAttempt,
      passMarkPercent:
        typeof item.passMarkPercent === "number"
          ? Number(item.passMarkPercent)
          : undefined,
      isFree,
      price: Number(price ?? 0),
      courseId,
      courseTitle: courseInfo?.title ?? null,
      courseSlug: courseInfo?.slug ?? null,
      scheduledAt: item.scheduledAt ?? null,
      closesAt: item.closesAt ?? null,
    };
  };

  const allExams: UnifiedExamCard[] = [
    ...freeTests.map((item) => buildExam(item as any, "free", true, 0)),
    ...preliminaryExams.map((item) => {
      const courseId = (item as any).courseId?.toString() ?? null;
      const courseInfo = courseId ? (courseMap.get(courseId) ?? null) : null;
      return buildExam(
        item as any,
        "preliminary",
        false,
        courseInfo?.price ?? 0
      );
    }),
    ...writtenExams.map((item) => {
      const courseId = (item as any).courseId?.toString() ?? null;
      const courseInfo = courseId ? (courseMap.get(courseId) ?? null) : null;
      return buildExam(item as any, "written", false, courseInfo?.price ?? 0);
    }),
  ];

  const lowered = search.toLowerCase();

  const filtered = allExams.filter((exam) => {
    if (scope === "free" && !exam.isFree) {
      return false;
    }

    if (scope === "paid" && exam.isFree) {
      return false;
    }

    if (filters.kind && filters.kind !== "all" && exam.kind !== filters.kind) {
      return false;
    }

    if (lowered) {
      const text = `${exam.title} ${exam.description}`.toLowerCase();
      if (!text.includes(lowered)) {
        return false;
      }
    }

    return true;
  });

  filtered.sort((left, right) => {
    if (left.isFree !== right.isFree) {
      return Number(right.isFree) - Number(left.isFree);
    }

    const leftDate = left.scheduledAt ?? left.closesAt ?? new Date(0);
    const rightDate = right.scheduledAt ?? right.closesAt ?? new Date(0);
    const dateDiff = Number(rightDate) - Number(leftDate);

    if (dateDiff !== 0) {
      return dateDiff;
    }

    const leftCreated = new Date((left as any).createdAt ?? 0).getTime();
    const rightCreated = new Date((right as any).createdAt ?? 0).getTime();
    return rightCreated - leftCreated;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return {
    exams: paged,
    pagination: buildPaginationMeta({ page: safePage, limit }, total),
  };
}
