"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  LogOut,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  variant: "dashboard" | "admin";
  breadcrumbs: Record<string, string[]>;
  profileHref: string;
  onToggleSidebar: () => void;
};

type HeaderUser = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function AppHeader({
  variant,
  breadcrumbs,
  profileHref,
  onToggleSidebar,
}: AppHeaderProps) {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    let active = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");
        const result = (await response.json()) as {
          data?: {
            user?: HeaderUser;
          };
        };

        if (active && response.ok && result.data?.user) {
          setUser(result.data.user);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function updateScrolledState() {
      const nextScrolled = window.scrollY > 0;
      setScrolled((current) =>
        current === nextScrolled ? current : nextScrolled,
      );
    }

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrolledState);
    };
  }, []);

  const segments = getBreadcrumbs(pathname, breadcrumbs, variant);
  const SidebarToggleIcon = variant === "admin" ? PanelLeftClose : PanelLeft;
  const currentTheme = resolvedTheme ?? theme ?? "light";

  return (
    <header
      className={`
        sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between
        border-b border-border bg-background/95 px-4 backdrop-blur lg:px-6
        transition-[background-color,box-shadow] duration-300 ease-in-out
        ${scrolled ? "shadow-md" : "shadow-none"}
      `}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          aria-label={`Toggle ${variant} sidebar`}
          onClick={onToggleSidebar}
          className="
            inline-flex h-9 w-9 cursor-pointer items-center justify-center
            rounded-md p-0 text-primary transition-colors hover:bg-primary/5
          "
        >
          <SidebarToggleIcon size={20} strokeWidth={1.75} />
        </Button>
        <span className="font-heading text-base font-bold text-primary lg:hidden">
          {variant === "admin" ? "BJS Prep · Admin" : "BJS Prep"}
        </span>
        <nav
          aria-label="Breadcrumb"
          className="hidden min-w-0 items-center gap-2 text-sm lg:flex"
        >
          {segments.map((segment, index) => (
            <span
              key={`${segment}-${index}`}
              className="inline-flex min-w-0 items-center gap-2"
            >
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  size={14}
                  className="shrink-0 text-muted/60"
                />
              ) : null}
              <span
                className={
                  index === segments.length - 1
                    ? "truncate font-medium text-foreground"
                    : "truncate text-muted"
                }
              >
                {segment}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {mounted ? (
          <Button
            type="button"
            variant="ghost"
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(currentTheme === "dark" ? "light" : "dark")
            }
            className="
              h-9 w-9 cursor-pointer rounded-md p-0 text-primary
              transition-colors hover:bg-primary/5
            "
          >
            {currentTheme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
        ) : (
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center text-primary"
          >
            <Sun size={18} />
          </span>
        )}

        <DropdownMenu closeOnOutsideClick closeOnScroll>
          <DropdownMenuTrigger>
            <Button
              type="button"
              variant="ghost"
              aria-label="Open user menu"
              className="
                h-9 w-9 cursor-pointer rounded-full p-0 text-primary
                transition-colors hover:bg-primary/5
              "
            >
              <UserAvatar avatarUrl={user?.avatarUrl ?? null} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <div className="border-b border-border px-3 py-3">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name ?? "Your account"}
              </p>
              <p className="truncate text-xs text-muted">
                {user?.email ?? "Loading account details"}
              </p>
            </div>
            <MenuLink href={profileHref} icon={<User size={16} />}>
              Profile
            </MenuLink>
            <DropdownMenuSeparator />
            <MenuLink href="/terms" icon={<FileText size={16} />}>
              Terms
            </MenuLink>
            <MenuLink href="/privacy" icon={<Shield size={16} />}>
              Privacy
            </MenuLink>
            <DropdownMenuSeparator />
            <button
              type="button"
              onClick={logout}
              className="
                flex min-h-9 w-full cursor-pointer items-center gap-3 rounded
                px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-accent focus-visible:ring-offset-2
              "
            >
              <LogOut size={16} />
              Log out
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function UserAvatar({ avatarUrl }: { avatarUrl: string | null }) {
  return avatarUrl ? (
    <Image
      src={avatarUrl}
      alt=""
      width={32}
      height={32}
      unoptimized
      className="h-8 w-8 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
      <User size={18} />
    </span>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: string;
}) {
  return (
    <Link
      href={href}
      className="
        flex min-h-9 cursor-pointer items-center gap-3 rounded px-3 py-2
        text-sm text-primary hover:bg-primary/5 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-accent
        focus-visible:ring-offset-2 focus-visible:ring-offset-background
      "
    >
      {icon}
      {children}
    </Link>
  );
}

function getBreadcrumbs(
  pathname: string,
  breadcrumbs: Record<string, string[]>,
  variant: AppHeaderProps["variant"],
) {
  if (
    variant === "dashboard" &&
    pathname.startsWith("/dashboard/mock-exams/") &&
    pathname !== "/dashboard/mock-exams"
  ) {
    return ["Dashboard", "Mock Exams", "Take Test"];
  }

  if (variant === "admin" && pathname.startsWith("/admin/students/")) {
    return ["Admin", "Students", "Student details"];
  }

  return breadcrumbs[pathname] ?? [variant === "admin" ? "Admin" : "Dashboard"];
}

async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    window.location.href = "/login";
  }
}
