"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PaginationBar } from "@/components/ui/pagination-bar";
import { buildQuery } from "@/lib/query-params";

type QueryPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
};

export function QueryPagination(props: QueryPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changePage(page: number) {
    const current = new URLSearchParams(searchParams.toString());
    const query = buildQuery(current, { page });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div className="bg-cream px-4 pb-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <PaginationBar {...props} onPageChange={changePage} />
      </div>
    </div>
  );
}
