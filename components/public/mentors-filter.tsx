"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { buildQuery } from "@/lib/query-params";

export function PublicMentorsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = new URLSearchParams(searchParams.toString());
  const search = searchParams.get("search") ?? "";
  const specialization = searchParams.get("specialization") ?? "all";

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
          showClear={Boolean(search || specialization !== "all")}
          onClear={() => router.replace(pathname, { scroll: false })}
        >
          <SearchInput
            value={search}
            onChange={(value) => update("search", value)}
            placeholder="Search mentors"
            className="sm:max-w-80"
          />
          <FilterSelect
            value={specialization}
            onValueChange={(value) => update("specialization", value)}
            placeholder="All specializations"
            aria-label="Filter mentors by specialization"
            options={[
              { value: "Constitutional Law", label: "Constitutional Law" },
              { value: "Criminal Procedure", label: "Criminal Procedure" },
              { value: "Written Answers", label: "Written Answers" },
              { value: "Viva Coaching", label: "Viva Coaching" },
              { value: "MCQ Strategy", label: "MCQ Strategy" },
            ]}
          />
        </FilterBar>
      </div>
    </section>
  );
}
