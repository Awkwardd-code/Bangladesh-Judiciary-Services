"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark =
    mounted && (resolvedTheme ?? theme ?? "light") === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      disabled={!mounted}
      className="
        group
        flex
        min-h-11
        w-full
        items-center
        justify-between
        rounded-md
        px-3
        py-2
        text-sm
        text-cream/80
        transition-colors
        hover:bg-cream/10
        hover:text-cream
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-accent
        focus-visible:ring-offset-2
        focus-visible:ring-offset-primary
        disabled:pointer-events-none
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      <span className="flex items-center gap-3">
        {isDark ? (
          <Moon size={18} strokeWidth={1.75} />
        ) : (
          <Sun size={18} strokeWidth={1.75} />
        )}
        <span>{isDark ? "Dark mode" : "Light mode"}</span>
      </span>

      <span className="text-xs text-cream/50">{isDark ? "On" : "Off"}</span>
    </button>
  );
}
