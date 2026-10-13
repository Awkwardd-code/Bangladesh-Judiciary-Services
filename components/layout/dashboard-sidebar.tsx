"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useDashboardShell } from "@/components/layout/dashboard-shell-provider";
import { cn } from "@/lib/utils";

const links = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Learning", href: "/dashboard/courses", icon: BookOpen },
  { label: "Take a Test", href: "/dashboard/exams", icon: FileText },
  { label: "Results", href: "/dashboard/results", icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", icon: User },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, setOpen, collapsed } = useDashboardShell();

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col overflow-hidden border-r border-cream/10 bg-primary-dark text-cream shadow-xl shadow-primary/10 transition-[width] duration-300 ease-in-out lg:flex",
          collapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <SidebarLinks
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={() => undefined}
          onLogout={() => void logout()}
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
          collapsed={false}
          onNavigate={() => setOpen(false)}
          onLogout={() => void logout()}
          mobile
        />
      </SheetContent>
    </Sheet>
  );
}

function SidebarLinks({
  pathname,
  collapsed,
  onNavigate,
  onLogout,
  mobile = false,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
  onLogout: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex items-center px-4 pt-5",
          collapsed ? "justify-center pb-5" : "justify-between pb-5"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          title="LegalPath Bangladesh"
          className={cn(
            "inline-flex items-center gap-3 whitespace-nowrap font-heading font-bold tracking-tight",
            collapsed ? "text-base" : mobile ? "pr-12 text-base" : "text-base"
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft font-heading text-sm font-extrabold text-primary-dark shadow-sm shadow-accent/20">
            LP
          </span>
          {!collapsed ? (
            <span className="shrink-0">LegalPath BD</span>
          ) : null}
        </Link>
      </div>

      {!collapsed ? (
        <p className="px-5 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/40">
          Workspace
        </p>
      ) : null}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {links.map(({ label, href, icon: Icon }) => {
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
                "relative flex min-h-11 cursor-pointer items-center rounded-xl py-2 text-sm transition-all",
                collapsed ? "justify-center px-2" : "gap-3 px-3.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
                active
                  ? "bg-cream/10 font-semibold text-cream shadow-inner shadow-white/[0.03]"
                  : "text-cream/65 hover:bg-cream/[0.06] hover:text-cream"
              )}
            >
              {active ? (
                <span className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-accent" />
              ) : null}
              <Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.8}
                className={active ? "text-accent-on-dark" : ""}
              />
              {collapsed ? <span className="sr-only">{label}</span> : label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-cream/10 p-3">
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "mb-1 flex min-h-10 w-full cursor-pointer items-center rounded-xl",
            "text-sm text-cream/60 hover:bg-cream/[0.06] hover:text-cream",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            collapsed ? "justify-center px-2" : "gap-3 px-3"
          )}
        >
          <LogOut size={18} />
          {!collapsed ? "Logout" : <span className="sr-only">Logout</span>}
        </button>
        {!collapsed ? (
          <Link
            href="/"
            onClick={onNavigate}
            className="flex min-h-10 cursor-pointer items-center rounded-xl px-3 text-sm text-cream/60 hover:bg-cream/[0.06] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Back to site
          </Link>
        ) : null}
      </div>
    </div>
  );
}
