"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { buildQuery } from "@/lib/query-params";

export function PaymentsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = new URLSearchParams(searchParams.toString());
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const method = searchParams.get("method") ?? "all";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function update(key: string, value: string) {
    const query = buildQuery(current, { [key]: value });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <FilterBar
      className="mt-6"
      showClear={Boolean(search || status !== "all" || method !== "all" || from || to)}
      onClear={() => router.replace(pathname, { scroll: false })}
    >
      <SearchInput
        className="sm:max-w-72"
        value={search}
        onChange={(value) => update("search", value)}
        placeholder="Search transaction or user"
      />
      <FilterSelect
        value={status}
        onValueChange={(value) => update("status", value)}
        placeholder="All statuses"
        aria-label="Payment status"
        options={[
          { value: "completed", label: "Completed" },
          { value: "pending", label: "Pending" },
          { value: "failed", label: "Failed" },
          { value: "refunded", label: "Refunded" },
        ]}
      />
      <FilterSelect
        value={method}
        onValueChange={(value) => update("method", value)}
        placeholder="All methods"
        aria-label="Payment method"
        options={[
          { value: "bkash", label: "bKash" },
          { value: "nagad", label: "Nagad" },
          { value: "bank", label: "Bank" },
        ]}
      />
      <label className="flex h-10 items-center gap-2 text-xs text-muted">
        From
        <input
          type="date"
          value={from}
          onChange={(event) => update("from", event.target.value)}
          className="h-10 cursor-pointer rounded-md border border-border bg-card px-2 text-sm text-primary"
          aria-label="Payments from date"
        />
      </label>
      <label className="flex h-10 items-center gap-2 text-xs text-muted">
        To
        <input
          type="date"
          value={to}
          onChange={(event) => update("to", event.target.value)}
          className="h-10 cursor-pointer rounded-md border border-border bg-card px-2 text-sm text-primary"
          aria-label="Payments to date"
        />
      </label>
    </FilterBar>
  );
}
