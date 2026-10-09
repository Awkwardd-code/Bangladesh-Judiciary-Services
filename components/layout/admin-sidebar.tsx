"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  CreditCard,
  ArrowLeft,
  BookOpen,
  FileText,
  LayoutDashboard,
  Megaphone,
  Trophy,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAdminShell } from "@/components/layout/admin-shell-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Enrollments", href: "/admin/enrollments", icon: ClipboardCheck },
  { label: "Mentors", href: "/admin/mentors", icon: Users },
  {
    label: "Success Stories",
    href: "/admin/success-stories",
    icon: Sparkles,
  },
  { label: "Notices", href: "/admin/notices", icon: Megaphone },
  {
    label: "Model Tests",
    href: "/admin/mock-exams",
    icon: FileText,
  },
  {
    label: "Leaderboard",
    href: "/admin/leaderboard",
    icon: Trophy,
  },
  {
    label: "Question Bank",
    href: "/admin/question-bank",
    icon: BookOpen,
  },
  {
    label: "Free Model Tests",
    href: "/admin/free-tests",
    icon: FileText,
  },
  {
    label: "Written Submissions",
    href: "/admin/written-submissions",
    icon: ClipboardCheck,
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  { label: "About", href: "/admin/about", icon: BookOpen },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { open, setOpen, collapsed } = useAdminShell();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <aside
        className={cn(
          `
            fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col
            overflow-hidden bg-primary text-cream transition-[width]
            duration-300 ease-in-out lg:flex
          `,
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
          title="BJS Prep Admin"
          className={cn(
            "font-heading font-bold",
            collapsed ? "text-base" : mobile ? "pr-12 text-lg" : "text-lg"
          )}
        >
          {collapsed ? (
            "BJS"
          ) : (
            <>
              BJS Prep <span className="text-accent">·</span>{" "}
              <span className="text-sm font-medium text-cream/70">Admin</span>
            </>
          )}
        </Link>
      </div>

      {!collapsed ? (
        <div className="px-4 pb-4">
          <Badge className="w-fit rounded-full border-accent text-xs text-accent">
            Administrator
          </Badge>
        </div>
      ) : null}

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {navItems.map((item) => {
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
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-primary",
                active
                  ? "bg-cream/10 font-medium text-cream"
                  : "text-cream/80 hover:bg-cream/10 hover:text-cream"
              )}
            >
              {active && (
                <span className="absolute inset-y-1 left-0 w-1 rounded-r bg-accent" />
              )}
              <Icon size={18} strokeWidth={1.75} />
              {collapsed ? (
                <span className="sr-only">{item.label}</span>
              ) : (
                <span>{item.label}</span>
              )}
            </Link>
          );
        })}
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
          <ArrowLeft size={18} />
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
