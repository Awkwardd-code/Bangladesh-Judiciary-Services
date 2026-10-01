"use client";

import { useEffect, useState } from "react";

type StorySummary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  featured: number;
};

const emptySummary: StorySummary = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  featured: 0,
};

export function SuccessStoriesSummary() {
  const [summary, setSummary] = useState(emptySummary);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        const response = await fetch("/api/admin/success-stories?limit=1");
        const result = (await response.json()) as {
          data?: { summary?: StorySummary };
        };

        if (active && response.ok) {
          setSummary(result.data?.summary ?? emptySummary);
        }
      } catch {
        if (active) {
          setSummary(emptySummary);
        }
      }
    }

    void loadSummary();
    window.addEventListener("refresh-success-story-summary", loadSummary);

    return () => {
      active = false;
      window.removeEventListener("refresh-success-story-summary", loadSummary);
    };
  }, []);

  const cards = [
    { label: "Total", value: summary.total, color: "text-primary" },
    { label: "Pending", value: summary.pending, color: "text-amber-700" },
    { label: "Approved", value: summary.approved, color: "text-emerald-700" },
    { label: "Featured", value: summary.featured, color: "text-accent" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm"
        >
          <span
            aria-hidden="true"
            className="absolute left-5 top-0 h-1 w-8 rounded-b bg-accent"
          />
          <p className="text-xs uppercase tracking-wide text-muted">
            {card.label}
          </p>
          <p className={`mt-2 font-heading text-3xl font-bold ${card.color}`}>
            {card.value.toLocaleString()}
          </p>
        </article>
      ))}
    </div>
  );
}
