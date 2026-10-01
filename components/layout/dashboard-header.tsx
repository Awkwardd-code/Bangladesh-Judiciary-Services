"use client";

import { AppHeader } from "@/components/layout/app-header";
import { useDashboardShell } from "@/components/layout/dashboard-shell-provider";

const BREADCRUMBS: Record<string, string[]> = {
  "/dashboard": ["Dashboard"],
  "/dashboard/mock-exams": ["Dashboard", "Mock Exams"],
  "/dashboard/results": ["Dashboard", "Results"],
  "/dashboard/materials": ["Dashboard", "Materials"],
  "/dashboard/profile": ["Dashboard", "Profile"],
};

export function DashboardHeader() {
  const { setOpen, toggleCollapsed } = useDashboardShell();

  return (
    <AppHeader
      variant="dashboard"
      breadcrumbs={BREADCRUMBS}
      profileHref="/dashboard/profile"
      onToggleSidebar={() => {
        if (window.innerWidth < 1024) {
          setOpen((open) => !open);
          return;
        }

        toggleCollapsed();
      }}
    />
  );
}
