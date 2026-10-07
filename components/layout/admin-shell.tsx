"use client";

import type { ReactNode } from "react";

import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { useAdminShell } from "@/components/layout/admin-shell-provider";
import { Toaster } from "@/components/ui/toaster";

export function AdminShell({ children }: { children: ReactNode }) {
  const { collapsed } = useAdminShell();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <div
        className={`
          flex min-w-0 flex-1 flex-col transition-[padding] duration-300
          ease-in-out ${collapsed ? "lg:pl-16" : "lg:pl-64"}
        `}
      >
        <AdminHeader />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
