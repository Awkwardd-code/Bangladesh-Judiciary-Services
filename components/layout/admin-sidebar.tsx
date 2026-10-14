"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Info,
  LayoutDashboard,
  Megaphone,
  Sparkles,
  Trophy,
  User,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAdminShell } from "@/components/layout/admin-shell-provider";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    heading: "Core",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Students", href: "/admin/students", icon: Users },
      { label: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
      { label: "Enrollments", href: "/admin/enrollments", icon: ClipboardList },
    ],
  },
  {
    heading: "Content",
    items: [
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      {
        label: "Exam Courses",
        href: "/admin/exam-courses",
        icon: ClipboardCheck,
      },
      { label: "Mentors", href: "/admin/mentors", icon: GraduationCap },
      {
        label: "Success Stories",
        href: "/admin/success-stories",
        icon: Sparkles,
      },
      { label: "Notices", href: "/admin/notices", icon: Megaphone },
    ],
  },
  {
    heading: "Exams",
    items: [
      { label: "Exams", href: "/admin/exams", icon: FileText },
      {
        label: "Exam Review",
        href: "/admin/exam-review",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    heading: "System",
    items: [
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "About", href: "/admin/about", icon: Info },
      { label: "Profile", href: "/admin/profile", icon: User },
    ],
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { open, setOpen, collapsed } = useAdminShell();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col overflow-hidden bg-primary text-cream transition-[width] duration-300 ease-in-out lg:flex",
          collapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={() => undefined}
        />
      </aside>
      <SheetContent
        id="admin-mobile-navigation"
        side="left"
        aria-label="Admin navigation"
        className="h-full w-[280px] flex-col p-0 sm:w-[320px]"
      >
        <SidebarContent
          pathname={pathname}
          collapsed={false}
          onNavigate={() => setOpen(false)}
          mobile
        />
      </SheetContent>
    </Sheet>
  );
}

function SidebarContent({
  pathname,
  collapsed,
  onNavigate,
  mobile = false,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex items-center px-4 pt-6",
          collapsed ? "justify-center pb-4" : "justify-between pb-2"
        )}
      >
        <Link
          href="/admin"
          onClick={onNavigate}
          title="LegalPath Bangladesh Admin"
          className={cn(
            "inline-flex items-center gap-2 whitespace-nowrap font-heading font-bold tracking-tight",
            collapsed ? "text-base" : mobile ? "pr-12 text-base" : "text-base"
          )}
        >
          <>
              <Image
                src="/legalpath-mark.svg"
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0"
              />
              {!collapsed ? (
                <>
              <span className="shrink-0">LegalPath BD</span>
              <span className="text-accent-on-dark">·</span>
              <span className="text-xs font-medium text-cream/70">Admin</span>
                </>
              ) : null}
          </>
        </Link>
      </div>

      {!collapsed ? (
        <div className="px-4 pb-4">
          <Badge className="w-fit rounded-full border-accent-on-dark text-xs text-accent-on-dark">
            Administrator
          </Badge>
        </div>
      ) : null}

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {navGroups.map((group) => (
          <div key={group.heading} className="mb-4">
            {!collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/50">
                {group.heading}
              </p>
            ) : null}

            {group.items.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  title={collapsed ? item.label : undefined}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex min-h-11 cursor-pointer items-center rounded-md py-2 text-sm transition-colors",
                    collapsed ? "justify-center px-2" : "gap-3 px-3",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
                    active
                      ? "bg-cream/10 font-medium text-cream"
                      : "text-cream/80 hover:bg-cream/10 hover:text-cream"
                  )}
                >
                  {active ? (
                    <span className="absolute inset-y-1 left-0 w-1 rounded-r bg-accent" />
                  ) : null}
                  <Icon size={18} strokeWidth={1.75} />
                  {collapsed ? (
                    <span className="sr-only">{item.label}</span>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-cream/10 p-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          title={collapsed ? "Back to dashboard" : undefined}
          className={cn(
            "mb-2 flex min-h-10 cursor-pointer items-center gap-3 rounded-md text-sm",
            "text-cream/70 hover:bg-cream/10 hover:text-cream",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            collapsed ? "justify-center px-2" : "px-3"
          )}
        >
          <LayoutDashboard size={18} />
          {!collapsed ? "Back to dashboard" : null}
        </Link>
        {!collapsed ? (
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
        ) : null}
      </div>
    </div>
  );
}
