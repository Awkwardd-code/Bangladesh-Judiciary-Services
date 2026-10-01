"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  children: ReactNode;
  onClear?: () => void;
  showClear?: boolean;
  className?: string;
};

export function FilterBar({
  children,
  onClear,
  showClear = false,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {children}
      </div>
      {showClear && onClear ? (
        <Button
          type="button"
          onClick={onClear}
          className="h-10 shrink-0 gap-2 px-3 text-muted hover:bg-primary/5 hover:text-primary"
        >
          <X size={15} />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
