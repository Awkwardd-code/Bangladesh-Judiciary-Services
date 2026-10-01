"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { buildQuery } from "@/lib/query-params";

export function ModelTestsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = new URLSearchParams(searchParams.toString());
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "all";

  function update(key: string, value: string) {
    const query = buildQuery(current, { [key]: value });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <section className="bg-cream px-4 pb-4 pt-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <FilterBar
          showClear={Boolean(search || category !== "all")}
          onClear={() => router.replace(pathname, { scroll: false })}
        >
          <SearchInput
            value={search}
            onChange={(value) => update("search", value)}
            placeholder="Search model tests"
            className="sm:max-w-80"
          />
          <FilterSelect
            value={category}
            onValueChange={(value) => update("category", value)}
            placeholder="All exam types"
            aria-label="Filter model tests by exam type"
            options={[
              { value: "preliminary", label: "Preliminary" },
              { value: "written", label: "Written" },
            ]}
          />
        </FilterBar>
      </div>
    </section>
  );
}
