"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type DropdownContextValue = {
  open: boolean;
  mounted: boolean;
  toggle: () => void;
  close: () => void;
};

const CLOSE_TRANSITION_MS = 200;

const DropdownContext = createContext<DropdownContextValue | null>(null);

export function DropdownMenu({
  children,
  closeOnOutsideClick = false,
  closeOnScroll = false,
}: {
  children: ReactNode;
  closeOnOutsideClick?: boolean;
  closeOnScroll?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    window.clearTimeout(closeTimer.current ?? undefined);
    closeTimer.current = window.setTimeout(() => {
      setMounted(false);
      closeTimer.current = null;
    }, CLOSE_TRANSITION_MS);
  }, []);

  const openMenu = useCallback(() => {
    window.clearTimeout(closeTimer.current ?? undefined);
    closeTimer.current = null;
    setMounted(true);
    setOpen(true);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      close();
      return;
    }

    openMenu();
  }, [close, open, openMenu]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function closeOnPointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        close();
      }
    }

    function closeOnScrollEvent() {
      close();
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    if (closeOnOutsideClick) {
      document.addEventListener("pointerdown", closeOnPointer);
    }

    if (closeOnScroll) {
      window.addEventListener("scroll", closeOnScrollEvent, {
        passive: true,
      });
      document.addEventListener("scroll", closeOnScrollEvent, true);
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnPointer);
      window.removeEventListener("scroll", closeOnScrollEvent);
      document.removeEventListener("scroll", closeOnScrollEvent, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [close, closeOnOutsideClick, closeOnScroll, open]);

  useEffect(
    () => () => {
      window.clearTimeout(closeTimer.current ?? undefined);
    },
    [],
  );

  return (
    <DropdownContext.Provider
      value={{
        open,
        mounted,
        toggle,
        close,
      }}
    >
      <div ref={menuRef} className="relative">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }: { children: ReactNode }) {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownMenuTrigger must be used inside DropdownMenu");
  }

  return (
    <span
      className="cursor-pointer"
      onClick={context.toggle}
      role="presentation"
    >
      {children}
    </span>
  );
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
}: {
  children: ReactNode;
  className?: string;
  align?: "start" | "end";
}) {
  const context = useContext(DropdownContext);

  if (!context || !context.mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute z-20 mt-2 min-w-44 origin-top-right rounded-md border border-border bg-card p-1 shadow-lg transition-[opacity,transform] duration-200 ease-out",
        align === "end" ? "right-0" : "left-0",
        context.open
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-1 opacity-0",
        className,
      )}
      aria-hidden={!context.open}
      inert={!context.open}
      onClickCapture={context.close}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  disabled,
  onClick,
  destructive,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "block min-h-9 w-full cursor-pointer rounded px-3 py-2 text-left text-sm",
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-primary hover:bg-primary/5",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border" />;
}
