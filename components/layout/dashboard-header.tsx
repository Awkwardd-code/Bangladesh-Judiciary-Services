"use client";

import { AppHeader } from "@/components/layout/app-header";
import { useDashboardShell } from "@/components/layout/dashboard-shell-provider";

const BREADCRUMBS: Record<string, string[]> = {
  "/dashboard": ["Dashboard"],
  "/dashboard/exams": ["Dashboard", "Exams"],
  "/dashboard/results": ["Dashboard", "Results"],
  "/dashboard/profile": ["Dashboard", "Profile"],
};

export function DashboardHeader() {
  const { open, setOpen, collapsed, toggleCollapsed } = useDashboardShell();

  return (
    <AppHeader
      variant="dashboard"
      breadcrumbs={BREADCRUMBS}
      profileHref="/dashboard/profile"
      sidebarCollapsed={collapsed}
      mobileNavigationOpen={open}
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
