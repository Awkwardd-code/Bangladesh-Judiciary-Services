"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { buildQuery } from "@/lib/query-params";

export function CoursesFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = new URLSearchParams(searchParams.toString());
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "all";
  const type = searchParams.get("type") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";

  function update(key: string, value: string) {
    const query = buildQuery(current, { [key]: value, page: 1 });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <section className="bg-cream px-4 pb-4 pt-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <FilterBar
          showClear={Boolean(search || category !== "all" || type !== "all" || sort !== "newest")}
          onClear={() => router.replace(pathname, { scroll: false })}
        >
          <SearchInput
            value={search}
            onChange={(value) => update("search", value)}
            placeholder="Search courses"
            className="sm:max-w-80"
          />
          <FilterSelect
            value={category}
            onValueChange={(value) => update("category", value)}
            placeholder="All categories"
            aria-label="Filter courses by category"
            options={[
              { value: "BJS", label: "BJS" },
              { value: "BAR", label: "BAR" },
              { value: "LLB", label: "LLB" },
            ]}
          />
          <FilterSelect
            value={type}
            onValueChange={(value) => update("type", value)}
            placeholder="All types"
            aria-label="Filter courses by cost"
            options={[
              { value: "free", label: "Free" },
              { value: "paid", label: "Paid" },
            ]}
          />
          <FilterSelect
            value={sort}
            onValueChange={(value) => update("sort", value)}
            aria-label="Sort courses"
            options={[
              { value: "newest", label: "Newest" },
              { value: "low", label: "Price: Low to High" },
              { value: "high", label: "Price: High to Low" },
            ]}
          />
        </FilterBar>
      </div>
    </section>
  );
}
