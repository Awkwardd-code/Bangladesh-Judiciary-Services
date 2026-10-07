import type { Metadata } from "next";

import { CtaBand } from "@/components/sections/cta-band";
import { ModelTestsHero } from "@/components/sections/model-tests-hero";
import { ModelTestsWhy } from "@/components/sections/model-tests-why";
import { ModelTestsFilter } from "@/components/public/model-tests-filter";
import { ModelTestsGrid } from "@/components/public/model-tests-grid";
import { QueryPagination } from "@/components/public/query-pagination";
import { listUnifiedExams } from "@/lib/exams-query";
import { getSessionFromCookies } from "@/lib/auth";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Model Tests | BJS Prep",
  description: "Browse free and paid model tests for BJS preparation.",
};

type ModelTestsPageParams = {
  search?: string;
  scope?: string;
  page?: string;
};

export default async function ModelTestsPage({
  searchParams,
}: {
  searchParams: Promise<ModelTestsPageParams>;
}) {
  const params = (await searchParams) ?? {};
  const search = params.search?.trim() ?? "";
  const scope = (params.scope as "all" | "free" | "paid") ?? "all";
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const limit = 12;

  const result = await listUnifiedExams({
    search,
    scope,
    page,
    limit,
  });

  const session = await getSessionFromCookies();
  const isLoggedIn = Boolean(session);

  const attemptMap: Record<
    string,
    { attempts: number; bestScore: number | null }
  > = {};

  return (
    <>
      <ModelTestsHero />
      <ModelTestsFilter />
      <ModelTestsGrid
        exams={result.exams}
        attemptMap={attemptMap}
        isLoggedIn={isLoggedIn}
      />
      <QueryPagination
        page={result.pagination.page}
        totalPages={result.pagination.totalPages}
        total={result.pagination.total}
        limit={limit}
      />
      <ModelTestsWhy />
      <CtaBand />
    </>
  );
}
