"use client";

import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { useDashboardShell } from "@/components/layout/dashboard-shell-provider";
import { Toaster } from "@/components/ui/toaster";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { collapsed } = useDashboardShell();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div
        className={`
          flex min-w-0 flex-1 flex-col transition-[padding] duration-300
          ease-in-out ${collapsed ? "lg:pl-16" : "lg:pl-64"}
        `}
      >
        <DashboardHeader />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
