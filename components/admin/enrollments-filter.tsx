"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { buildQuery } from "@/lib/query-params";

export function EnrollmentsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = new URLSearchParams(searchParams.toString());
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const course = searchParams.get("course") ?? "all";
  const isPaid = searchParams.get("isPaid") ?? "all";

  function update(key: string, value: string) {
    const query = buildQuery(current, { [key]: value });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <FilterBar
      className="mt-8"
      showClear={Boolean(
        search || status !== "all" || course !== "all" || isPaid !== "all",
      )}
      onClear={() => router.replace(pathname, { scroll: false })}
    >
      <SearchInput
        value={search}
        onChange={(value) => update("search", value)}
        placeholder="Search student or course"
        className="sm:max-w-80"
      />
      <FilterSelect
        value={status}
        onValueChange={(value) => update("status", value)}
        placeholder="All statuses"
        options={[
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
          { value: "revoked", label: "Revoked" },
        ]}
      />
      <FilterSelect
        value={course}
        onValueChange={(value) => update("course", value)}
        placeholder="All courses"
        options={[
          { value: "preliminary", label: "Preliminary" },
          { value: "written", label: "Written" },
          { value: "viva", label: "Viva" },
          { value: "foundation", label: "Foundation" },
        ]}
      />
      <FilterSelect
        value={isPaid}
        onValueChange={(value) => update("isPaid", value)}
        placeholder="All access types"
        options={[
          { value: "false", label: "Included" },
          { value: "true", label: "Paid" },
        ]}
      />
    </FilterBar>
  );
}
