"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { buildQuery } from "@/lib/query-params";

export function SuccessStoriesAdminFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const featured = searchParams.get("isFeatured") ?? "all";
  const current = new URLSearchParams(searchParams.toString());

  function update(key: string, value: string) {
    const query = buildQuery(current, { [key]: value });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <FilterBar
      showClear={Boolean(search || status !== "all" || featured !== "all")}
      onClear={() => router.replace(pathname, { scroll: false })}
    >
      <SearchInput
        value={search}
        onChange={(value) => update("search", value)}
        placeholder="Search name or university"
        className="sm:max-w-80"
      />
      <FilterSelect
        value={status}
        onValueChange={(value) => update("status", value)}
        placeholder="All statuses"
        aria-label="Filter by story status"
        options={[
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
        ]}
      />
      <FilterSelect
        value={featured}
        onValueChange={(value) => update("isFeatured", value)}
        placeholder="All stories"
        aria-label="Filter featured stories"
        options={[
          { value: "true", label: "Featured only" },
          { value: "false", label: "Unfeatured only" },
        ]}
      />
    </FilterBar>
  );
}
