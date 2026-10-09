"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AlertDialogContextValue = {
  open: boolean;
  show: () => void;
  hide: () => void;
};

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

export function AlertDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialogContext.Provider
      value={{ open, show: () => setOpen(true), hide: () => setOpen(false) }}
    >
      {children}
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogTrigger({ children }: { children: ReactNode }) {
  const context = useContext(AlertDialogContext);

  return (
    <span
      className="cursor-pointer"
      onClick={context?.show}
      role="presentation"
    >
      {children}
    </span>
  );
}

export function AlertDialogContent({ children }: { children: ReactNode }) {
  const context = useContext(AlertDialogContext);

  if (!context?.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-6">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function AlertDialogTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-heading text-xl font-bold text-primary">{children}</h2>
  );
}

export function AlertDialogDescription({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-sm leading-6 text-muted">{children}</p>;
}

export function AlertDialogFooter({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex justify-end gap-3">{children}</div>;
}

export function AlertDialogCancel({ children }: { children: ReactNode }) {
  const context = useContext(AlertDialogContext);

  return (
    <button
      type="button"
      onClick={context?.hide}
      className="h-10 cursor-pointer rounded-md border border-border px-4 text-sm text-foreground"
    >
      {children}
    </button>
  );
}

export function AlertDialogAction({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  const context = useContext(AlertDialogContext);

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        context?.hide();
      }}
      className="h-10 cursor-pointer rounded-md bg-primary px-4 text-sm text-cream"
    >
      {children}
    </button>
  );
}
