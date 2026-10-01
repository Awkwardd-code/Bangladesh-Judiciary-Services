import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { ActiveExamBanner } from "@/components/dashboard/active-exam-banner";
import { MockExamsFilter } from "@/components/dashboard/mock-exams-filter";
import { MockExamsGrid } from "@/components/dashboard/mock-exams-grid";
import { MockExamsHeader } from "@/components/dashboard/mock-exams-header";
import { requireSession } from "@/lib/auth-guard";
import { preliminaryExamsCol, writtenExamsCol } from "@/lib/collections";
import { getActiveExam } from "@/lib/exam-lock";
import { checkExamAccess } from "@/lib/exam-access";
import { QueryPagination } from "@/components/public/query-pagination";

export const metadata: Metadata = {
  title: "Mock Exams — BJS Prep",
  description: "Browse and take mock exams for the BJS preliminary and written rounds.",
};

export default async function MockExamsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
    sort?: string;
  }>;
}) {
  const session = await requireSession();

  if (!session) {
    redirect("/login?next=%2Fdashboard%2Fmock-exams");
  }

  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const category = params.category ?? "all";
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const limit = 9;
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

  const [preliminary, written] = await Promise.all([
    (await preliminaryExamsCol())
      .find(preliminaryFilter)
      .sort({ createdAt: -1 })
      .toArray(),
    (await writtenExamsCol())
      .find(writtenFilter)
      .sort({ createdAt: -1 })
      .toArray(),
  ]);
  const candidates = [
    ...preliminary.map((exam) => ({ ...exam, examType: "preliminary" as const })),
    ...written.map((exam) => ({ ...exam, examType: "written" as const })),
  ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  const accessible = await Promise.all(
    candidates.map(async (exam) => {
      const access = await checkExamAccess(
        new ObjectId(session.userId),
        exam._id,
        exam.examType,
      );
      return access.allowed || access.reason === "another-exam-active"
        ? exam
        : null;
    }),
  );
  const exams = accessible
    .filter((exam): exam is NonNullable<typeof exam> => exam !== null)
    .slice((page - 1) * limit, page * limit)
    .map((exam) => ({
      id: exam._id.toString(),
      title: exam.title,
      description: exam.description ?? "",
      questions: exam.totalQuestions,
      durationMinutes: exam.durationMinutes,
      examType: exam.examType,
      createdAt: exam.createdAt.toISOString(),
    }));
  const total = accessible.filter(Boolean).length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const active = await getActiveExam(new ObjectId(session.userId));

  let examTitle = "Your exam";

  if (active) {
    if (active.kind === "preliminary") {
      const exam = await (await preliminaryExamsCol()).findOne({
        _id: active.examId,
      });
      examTitle = exam?.title ?? "Preliminary mock exam";
    } else {
      const exam = await (await writtenExamsCol()).findOne({
        _id: active.examId,
      });
      examTitle = exam?.title ?? "Written mock exam";
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <MockExamsHeader />
      {active ? <ActiveExamBanner active={active} examTitle={examTitle} /> : null}
      <MockExamsFilter />
      <MockExamsGrid exams={exams} activeExam={active} />
      <QueryPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
      />
    </div>
  );
}
