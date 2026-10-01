"use client";

import Link from "next/link";
import { BookOpen, FileText, LayoutDashboard, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useDashboardShell } from "@/components/layout/dashboard-shell-provider";
import { cn } from "@/lib/utils";

const links = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Mock Exams", "/dashboard/mock-exams", FileText],
  ["Materials", "/dashboard/materials", BookOpen],
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const { open, setOpen, collapsed } = useDashboardShell();
  const [tier, setTier] = useState<string | null>(null);
  const [role, setRole] = useState<"student" | "admin" | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTier() {
      try {
        const response = await fetch("/api/auth/me");
        const result = (await response.json()) as {
          data?: { user?: { tier?: string; role?: "student" | "admin" } };
        };

        if (active && response.ok) {
          setTier(result.data?.user?.tier ?? null);
          setRole(result.data?.user?.role ?? null);
        }
      } catch {
        if (active) {
          setTier(null);
          setRole(null);
        }
      }
    }

    void loadTier();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <aside
        className={cn(
          `
            fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col
            overflow-hidden bg-primary text-cream transition-[width]
            duration-300 ease-in-out lg:flex
          `,
          collapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <SidebarLinks
          pathname={pathname}
          tier={tier}
          role={role}
          collapsed={collapsed}
          onNavigate={() => undefined}
        />
      </aside>
      <SheetContent
        id="dashboard-mobile-navigation"
        side="left"
        aria-label="Dashboard navigation"
        className="h-full w-[280px] flex-col p-0 sm:w-[320px]"
      >
        <SidebarLinks
          pathname={pathname}
          tier={tier}
          role={role}
          collapsed={false}
          onNavigate={() => setOpen(false)}
          mobile
        />
      </SheetContent>
    </Sheet>
  );
}

function SidebarLinks({
  pathname,
  tier,
  role,
  collapsed,
  onNavigate,
  mobile = false,
}: {
  pathname: string;
  tier: string | null;
  role: "student" | "admin" | null;
  collapsed: boolean;
  onNavigate: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex items-center px-4 pt-6",
          collapsed ? "justify-center pb-4" : "justify-between pb-2",
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          title="BJS Prep"
          className={cn(
            "font-heading font-bold",
            collapsed ? "text-base" : mobile ? "pr-12 text-lg" : "text-lg",
          )}
        >
          {collapsed ? "BJS" : "BJS Prep"}
        </Link>
      </div>
      {tier && !collapsed ? (
        <div className="px-4 pb-4">
          <span
            className="
              inline-flex items-center rounded-full border border-cream/15
              bg-cream/[0.04] px-3 py-1 text-xs text-cream/70
            "
          >
            {tier === "UNIVERSITY" ? "University student" : "General student"}
          </span>
        </div>
      ) : null}
      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {[...links, ...(role === "admin"
          ? [["Admin panel", "/admin", Shield] as const]
          : [])].map(([label, href, Icon]) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={collapsed ? label : undefined}
              onClick={onNavigate}
              className={cn(
                "relative flex min-h-11 cursor-pointer items-center rounded-md py-2 text-sm transition-colors",
                collapsed ? "justify-center px-2" : "gap-3 px-3",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
                active
                  ? "bg-cream/10 font-medium text-cream"
                  : "text-cream/80 hover:bg-cream/10 hover:text-cream",
              )}
            >
              {active ? (
                <span className="absolute inset-y-1 left-0 w-1 rounded-r bg-accent" />
              ) : null}
              <Icon size={18} />
              {collapsed ? <span className="sr-only">{label}</span> : label}
            </Link>
          );
        })}
      </nav>
      {!collapsed ? (
        <div className="mt-auto border-t border-cream/10 p-4">
          <Link
            href="/"
            onClick={onNavigate}
            className="
              flex min-h-10 cursor-pointer items-center rounded-md px-3
              text-sm text-cream/70 hover:bg-cream/10 hover:text-cream
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-accent focus-visible:ring-offset-2
              focus-visible:ring-offset-primary
            "
          >
            Back to site
          </Link>
        </div>
      ) : null}
    </div>
  );
}
