"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { buildQuery } from "@/lib/query-params";

export function StudentsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = new URLSearchParams(searchParams.toString());
  const search = searchParams.get("search") ?? "";
  const tier = searchParams.get("tier") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const role = searchParams.get("role") ?? "all";

  function update(key: string, value: string) {
    const query = buildQuery(current, { [key]: value });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <FilterBar
      className="mt-6"
      showClear={Boolean(search || tier !== "all" || status !== "all" || role !== "all")}
      onClear={() => router.replace(pathname, { scroll: false })}
    >
      <SearchInput
        value={search}
        onChange={(value) => update("search", value)}
        placeholder="Search name, email, roll, university"
        className="sm:max-w-80"
      />
      <FilterSelect
        value={tier}
        onValueChange={(value) => update("tier", value)}
        placeholder="All tiers"
        aria-label="Filter by tier"
        options={[
          { value: "UNIVERSITY", label: "University" },
          { value: "OTHER", label: "Other" },
        ]}
      />
      <FilterSelect
        value={status}
        onValueChange={(value) => update("status", value)}
        placeholder="All statuses"
        aria-label="Filter by status"
        options={[
          { value: "verified", label: "Verified" },
          { value: "unverified", label: "Unverified" },
          { value: "pending", label: "Pending approval" },
        ]}
      />
      <FilterSelect
        value={role}
        onValueChange={(value) => update("role", value)}
        placeholder="All roles"
        aria-label="Filter by role"
        options={[
          { value: "student", label: "Student" },
          { value: "admin", label: "Admin" },
        ]}
      />
    </FilterBar>
  );
}
