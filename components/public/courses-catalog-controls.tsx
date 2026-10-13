"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { buildQuery } from "@/lib/query-params";

export function CoursesCatalogSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "all";
  const type = searchParams.get("type") ?? "all";

  function update(key: string, value: string) {
    const current = new URLSearchParams(searchParams.toString());
    const query = buildQuery(current, { [key]: value, page: 1 });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false });
  }

  return (
    <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-primary">
          Filter courses
        </h2>
        {search || category !== "all" || type !== "all" ? (
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer text-xs font-medium text-accent hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>
      <div className="mt-5 space-y-5">
        <div className="block text-sm font-medium text-primary">
          Search
          <SearchInput
            value={search}
            onChange={(value) => update("search", value)}
            placeholder="Search courses"
            className="mt-2"
          />
        </div>
        <label className="block text-sm font-medium text-primary">
          Category
          <Select
            value={category}
            aria-label="Filter courses by category"
            onChange={(event) => update("category", event.target.value)}
            className="mt-2 w-full"
          >
            <option value="all">All categories</option>
            <option value="professional">Professional</option>
            <option value="academic">Academic</option>
          </Select>
        </label>
        <label className="block text-sm font-medium text-primary">
          Price
          <Select
            value={type}
            aria-label="Filter courses by cost"
            onChange={(event) => update("type", event.target.value)}
            className="mt-2 w-full"
          >
            <option value="all">All prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </Select>
        </label>
      </div>
    </aside>
  );
}

export function CoursesToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "newest";

  function updateSort(value: string) {
    const current = new URLSearchParams(searchParams.toString());
    const query = buildQuery(current, { sort: value, page: 1 });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Showing {total} {total === 1 ? "course" : "courses"}
      </p>
      <label className="flex items-center gap-2 text-sm text-muted">
        Sort by
        <Select
          value={sort}
          aria-label="Sort courses"
          onChange={(event) => updateSort(event.target.value)}
          className="w-48"
        >
          <option value="newest">Newest</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </Select>
      </label>
    </div>
  );
}
