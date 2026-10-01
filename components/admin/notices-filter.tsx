"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { buildQuery } from "@/lib/query-params";

export function NoticesFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = new URLSearchParams(searchParams.toString());
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";

  function update(key: string, value: string) {
    const query = buildQuery(current, { [key]: value });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <FilterBar
      className="mt-6"
      showClear={Boolean(search || status !== "all")}
      onClear={() => router.replace(pathname, { scroll: false })}
    >
      <SearchInput
        value={search}
        onChange={(value) => update("search", value)}
        placeholder="Search notices"
        className="sm:max-w-80"
      />
      <FilterSelect
        value={status}
        onValueChange={(value) => update("status", value)}
        placeholder="All statuses"
        aria-label="Filter notices by status"
        options={[
          { value: "draft", label: "Draft" },
          { value: "published", label: "Published" },
        ]}
      />
    </FilterBar>
  );
}
