"use client";

import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

const links = [
  ["Home", "/"],
  ["Courses", "/courses"],
  ["Model Tests", "/model-tests"],
  ["Mentors", "/mentors"],
  ["Success Stories", "/success-stories"],
  ["About", "/about"],
];

type SiteUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  avatarUrl: string | null;
};

export function SiteHeader({
  initialUser,
}: {
  initialUser: SiteUser | null;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = initialUser;
  const authChecked = true;
  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!userMenuOpen) {
      return undefined;
    }

    function closeOnOutsidePointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !userMenuRef.current?.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    }

    function closeOnScroll() {
      setUserMenuOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", closeOnScroll, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", closeOnScroll);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    function closeOnOutsidePointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [mobileMenuOpen]);

  return (
    <header
      ref={headerRef}
      className={`
        sticky top-0 z-50 bg-cream/95 backdrop-blur-sm
        transition-[background-color,box-shadow] duration-300 ease-in-out
        ${scrolled ? "shadow-md" : "shadow-none"}
      `}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between border-b border-border px-4 sm:px-6 lg:border-transparent">
        <Link href="/" className="font-heading text-lg font-bold text-primary">
          BJS Prep
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="cursor-pointer text-sm text-muted transition-colors hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {authChecked && user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((open) => !open)}
                className="
                  flex h-10 min-w-10 cursor-pointer items-center justify-center
                  rounded-full px-2 text-primary transition-colors hover:bg-primary/5
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-accent focus-visible:ring-offset-2
                "
              >
                <span className="max-w-28 truncate text-sm font-medium">
                  {user.name.split(" ")[0]}
                </span>
              </button>
              <div
                role="menu"
                aria-hidden={!userMenuOpen}
                inert={!userMenuOpen}
                className={`
                  absolute right-0 top-full z-50 mt-2 w-64 origin-top-right
                  rounded-md border border-border bg-card p-2 shadow-lg
                  transition-[opacity,transform] duration-300 ease-in-out
                  ${
                    userMenuOpen
                      ? "translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none translate-y-1 scale-95 opacity-0"
                  }
                `}
              >
                <div className="border-b border-border px-3 py-3">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
                {user.role === "admin" ? (
                  <Link
                    href="/admin"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="
                      flex min-h-10 cursor-pointer items-center gap-3
                      rounded px-3 py-2 text-sm text-primary
                      hover:bg-primary/5 focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-accent
                    "
                  >
                    Admin panel
                  </Link>
                ) : null}
                <Link
                  href="/dashboard"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="
                    mt-1 flex min-h-10 cursor-pointer items-center gap-3
                    rounded px-3 py-2 text-sm text-primary
                    hover:bg-primary/5 focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-accent
                  "
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="
                    flex min-h-10 cursor-pointer items-center gap-3
                    rounded px-3 py-2 text-sm text-primary
                    hover:bg-primary/5 focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-accent
                  "
                >
                  Profile
                </Link>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={logout}
                  className="
                    flex min-h-10 w-full cursor-pointer items-center gap-3
                    rounded px-3 py-2 text-left text-sm text-red-600
                    hover:bg-red-50 focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-accent
                  "
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </div>
          ) : authChecked ? (
            <div className="hidden items-center gap-4 md:flex">
              <Link
                href="/login"
                className="text-sm text-muted hover:text-primary"
              >
                Login
              </Link>
              <Button
                href="/register"
                className="bg-primary text-cream hover:bg-primary-dark"
              >
                Get Started
              </Button>
            </div>
          ) : (
            <span className="hidden h-10 w-32 md:block" aria-hidden="true" />
          )}
          <button
            type="button"
            className="
              flex min-h-10 min-w-10 cursor-pointer items-center
              justify-center rounded-md p-2 text-primary
              hover:bg-primary/5 md:hidden
            "
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
      {mobileMenuOpen ? (
        <nav
          id="mobile-navigation"
          className="border-b border-border bg-cream px-4 py-5 sm:px-6 md:hidden"
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="block cursor-pointer border-b border-border py-3 text-sm text-primary"
            >
              {label}
            </Link>
          ))}
          {authChecked && !user ? (
            <div className="mt-4 border-t border-border pt-4">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center justify-center text-sm text-muted"
              >
                Login
              </Link>
              <Button
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-11 w-full bg-primary text-cream"
              >
                Get Started
              </Button>
            </div>
          ) : user ? (
            <div className="mt-4 border-t border-border pt-4">
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block border-b border-border py-3 text-sm text-primary"
                >
                  Admin panel
                </Link>
              ) : null}
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block border-b border-border py-3 text-sm text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block border-b border-border py-3 text-sm text-primary"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={logout}
                className="block min-h-11 w-full text-left text-sm text-red-600"
              >
                Log out
              </button>
            </div>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}

async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    window.location.href = "/login";
  }
}
