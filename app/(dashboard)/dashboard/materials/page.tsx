import type { Metadata } from "next";

import { MaterialsFilter } from "@/components/dashboard/materials-filter";
import { MaterialsGrid } from "@/components/dashboard/materials-grid";
import { MaterialsHeader } from "@/components/dashboard/materials-header";

export const metadata: Metadata = {
  title: "Materials — BJS Prep",
  description: "Reading materials, notes, and resources.",
};

export default function MaterialsPage() {
  // NOTE: auth guard will be added via middleware in a later pass.
  return (
    <div className="mx-auto max-w-6xl">
      <MaterialsHeader />
      <MaterialsFilter />
      <MaterialsGrid />
    </div>
  );
}
