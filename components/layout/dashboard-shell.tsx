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
        <main className="relative min-w-0 flex-1 bg-[radial-gradient(ellipse_at_top_left,rgba(184,115,51,0.07),transparent_32rem)] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
