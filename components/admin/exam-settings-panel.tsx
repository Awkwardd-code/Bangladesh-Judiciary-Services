"use client";

import type { FormEventHandler, ReactNode } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ExamSettingsPanel({
  children,
  description,
  error,
  footer,
  onSubmit,
  saving,
  saveLabel = "Save settings",
}: {
  children: ReactNode;
  description: string;
  error?: string;
  footer?: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  saving: boolean;
  saveLabel?: string;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-5 max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <header className="border-b border-border bg-slate-50/80 px-5 py-5 sm:px-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Configuration
        </p>
        <h2 className="mt-1 font-heading text-xl font-semibold text-primary">
          Exam settings
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
          {description}
        </p>
      </header>
      <div className="space-y-6 p-5 sm:p-7">{children}</div>
      {error ? (
        <p
          role="alert"
          className="mx-5 mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-7"
        >
          {error}
        </p>
      ) : null}
      <footer className="flex justify-end border-t border-border bg-slate-50/80 px-5 py-4 sm:px-7">
        {footer ?? (
          <Button
            type="submit"
            disabled={saving}
            className="h-10 rounded-lg px-5"
          >
            <Save size={16} />
            {saving ? "Saving…" : saveLabel}
          </Button>
        )}
      </footer>
    </form>
  );
}

export function ExamSettingsField({
  children,
  hint,
  label,
  className = "",
}: {
  children: ReactNode;
  hint?: string;
  label: string;
  className?: string;
}) {
  return (
    <label
      className={`block space-y-2 text-sm font-medium text-primary ${className}`}
    >
      <span>{label}</span>
      {children}
      {hint ? (
        <span className="block text-xs font-normal leading-5 text-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function examTabClass(active: boolean) {
  return active
    ? "rounded-lg bg-primary px-4 py-2 text-sm font-medium capitalize text-cream shadow-sm"
    : "rounded-lg px-4 py-2 text-sm font-medium capitalize text-muted transition-colors hover:bg-primary/5 hover:text-primary";
}
