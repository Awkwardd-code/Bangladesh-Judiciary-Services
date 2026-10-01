"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { buildQuery } from "@/lib/query-params";

export function MentorsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const publishedValue = searchParams.get("isPublished") ?? "all";
  const current = new URLSearchParams(searchParams.toString());

  function update(key: string, value: string) {
    const query = buildQuery(current, { [key]: value });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <FilterBar
      className="mt-6"
      showClear={Boolean(search || publishedValue !== "all")}
      onClear={() => router.replace(pathname, { scroll: false })}
    >
      <SearchInput
        value={search}
        onChange={(value) => update("search", value)}
        placeholder="Search mentors"
        className="sm:max-w-80"
      />
      <FilterSelect
        value={publishedValue}
        onValueChange={(value) => update("isPublished", value)}
        placeholder="All mentors"
        aria-label="Filter mentors by publication status"
        options={[
          { value: "true", label: "Published" },
          { value: "false", label: "Unpublished" },
        ]}
      />
    </FilterBar>
  );
}