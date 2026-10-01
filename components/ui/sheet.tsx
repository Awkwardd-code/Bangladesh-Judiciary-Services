"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

type SheetContentProps = HTMLAttributes<HTMLDivElement> & {
  side?: "left" | "right";
};

const SheetContext = createContext<SheetContextValue | null>(null);

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({
  children,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useSheetContext();

  return (
    <button
      {...props}
      aria-expanded={context.open}
      onClick={(event) => {
        onClick?.(event);
        context.onOpenChange(!context.open);
      }}
    >
      {children}
    </button>
  );
}

export function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: SheetContentProps) {
  const { open, onOpenChange } = useSheetContext();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close navigation menu"
        tabIndex={-1}
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
      />
      <div
        {...props}
        role="dialog"
        aria-modal="true"
        aria-label={props["aria-label"] ?? "Navigation menu"}
        className={cn(
          "fixed inset-y-0 z-10 flex h-screen flex-col bg-primary text-cream shadow-xl",
          side === "left"
            ? "left-0 border-r border-cream/15"
            : "right-0 border-l border-cream/15",
          className,
        )}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => onOpenChange(false)}
          className="
            absolute right-3 top-3 z-10 flex min-h-10 min-w-10
            cursor-pointer items-center justify-center rounded-md
            text-cream/70 hover:text-cream
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-accent focus-visible:ring-offset-2
              focus-visible:ring-offset-primary
          "
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

function useSheetContext(): SheetContextValue {
  const context = useContext(SheetContext);

  if (!context) {
    throw new Error("Sheet components must be used inside Sheet");
  }

  return context;
}
