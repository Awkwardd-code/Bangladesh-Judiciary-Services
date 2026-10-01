"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { buildQuery } from "@/lib/query-params";

export function MockExamsFilter() {
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
    <FilterBar
      className="mt-2"
      showClear={Boolean(search || category !== "all")}
      onClear={() => router.replace(pathname, { scroll: false })}
    >
      <SearchInput
        value={search}
        onChange={(value) => update("search", value)}
        placeholder="Search mock exams"
        className="sm:max-w-80"
      />
      <FilterSelect
        value={category}
        onValueChange={(value) => update("category", value)}
        placeholder="All exam types"
        options={[
          { value: "preliminary", label: "Preliminary" },
          { value: "written", label: "Written" },
        ]}
      />
    </FilterBar>
  );
}
