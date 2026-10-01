"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";

const categories = ["All", "Criminal Law", "Civil Law", "Evidence", "Constitutional Law", "Reference"];

export function MaterialsFilter() {
  const [active, setActive] = useState("All");

  return (
    <div
      className="
        -mx-4 mt-2 flex flex-nowrap gap-2 overflow-x-auto px-4
        sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0
      "
    >
      {categories.map((category) => (
        <button key={category} type="button" onClick={() => setActive(category)}>
          <Badge className={active === category ? "cursor-pointer rounded-full border-primary bg-primary px-4 py-1.5 text-cream" : "cursor-pointer rounded-full border-border px-4 py-1.5 text-muted transition-colors hover:border-primary hover:text-primary"}>{category}</Badge>
        </button>
      ))}
      <p className="sr-only">NOTE: static filter UI — wire to URL query params in a later pass.</p>
    </div>
  );
}
