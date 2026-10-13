"use client";

import { RefreshCw } from "lucide-react";

export function AdminOverviewHeader() {
  const updatedAt = new Date();

  function handleRefresh() {
    window.location.reload();
  }

  return (
    <section className="w-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Overview
          </h1>
          <p className="mt-2 text-base text-muted">
            Platform at a glance — updated live.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-muted">
            Last updated: {updatedAt.toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>
    </section>
  );
}
