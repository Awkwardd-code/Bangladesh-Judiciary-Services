"use client";

import { AppHeader } from "@/components/layout/app-header";
import { useAdminShell } from "@/components/layout/admin-shell-provider";

const BREADCRUMBS: Record<string, string[]> = {
  "/admin": ["Admin"],
  "/admin/students": ["Admin", "Students"],
  "/admin/notices": ["Admin", "Notices"],
  "/admin/mock-exams": ["Admin", "Mock Exams"],
  "/admin/payments": ["Admin", "Payments"],
};

export function AdminHeader() {
  const { setOpen, toggleCollapsed } = useAdminShell();

  return (
    <AppHeader
      variant="admin"
      breadcrumbs={BREADCRUMBS}
      profileHref="/admin/profile"
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
