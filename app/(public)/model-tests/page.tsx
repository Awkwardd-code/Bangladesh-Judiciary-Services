import type { Metadata } from "next";
import { preliminaryExamsCol, writtenExamsCol } from "@/lib/collections";
import { ModelTestsHero } from "@/components/sections/model-tests-hero";
import { ModelTestsList } from "@/components/sections/model-tests-list";
import { ModelTestsWhy } from "@/components/sections/model-tests-why";
import { ModelTestsFilter } from "@/components/public/model-tests-filter";
import { QueryPagination } from "@/components/public/query-pagination";

export const metadata: Metadata = {
  title: "Model Tests",
  description:
    "Simulate the BJS exam with realistic timing and detailed review.",
};
type ModelTestParams = {
  search?: string;
  category?: string;
  page?: string;
};

export default async function ModelTestsPage({
  searchParams,
}: {
  searchParams: Promise<ModelTestParams>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const category = params.category;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const limit = 8;
  const regex = search
    ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    : null;
  const preliminaryFilter: Record<string, unknown> = { status: "published" };
  const writtenFilter: Record<string, unknown> = { status: "published" };

  if (category === "written") preliminaryFilter._id = { $exists: false };
  if (category === "preliminary") writtenFilter._id = { $exists: false };
  if (regex) {
    preliminaryFilter.title = regex;
    writtenFilter.title = regex;
  }

  const [preliminaryCollection, writtenCollection] = await Promise.all([
    preliminaryExamsCol(),
    writtenExamsCol(),
  ]);
  const amount = page * limit;
  const [preliminary, written, preliminaryTotal, writtenTotal] =
    await Promise.all([
      preliminaryCollection
        .find(preliminaryFilter)
        .sort({ createdAt: -1 })
        .limit(amount)
        .toArray(),
      writtenCollection
        .find(writtenFilter)
        .sort({ createdAt: -1 })
        .limit(amount)
        .toArray(),
      preliminaryCollection.countDocuments(preliminaryFilter),
      writtenCollection.countDocuments(writtenFilter),
    ]);
  const exams = [
    ...preliminary.map((exam) => ({ ...exam, examType: "preliminary" as const })),
    ...written.map((exam) => ({ ...exam, examType: "written" as const })),
  ]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice((page - 1) * limit, page * limit)
    .map((exam) => ({
      id: exam._id.toString(),
      title: exam.title,
      description: exam.description ?? "",
      durationMinutes: exam.durationMinutes,
      totalQuestions: exam.totalQuestions,
      totalMarks: exam.totalMarks,
      examType: exam.examType,
    }));
  const total = preliminaryTotal + writtenTotal;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <ModelTestsHero />
      <ModelTestsFilter />
      <ModelTestsList exams={exams} />
      <QueryPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
      />
      <ModelTestsWhy />
    </>
  );
}
