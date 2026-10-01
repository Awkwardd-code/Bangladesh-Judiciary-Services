"use client";

import { useEffect, useState } from "react";

export type QueryValue = string | number | boolean | null | undefined;

export function buildQuery(
  current: URLSearchParams,
  updates: Record<string, QueryValue>,
): string {
  const params = new URLSearchParams(current.toString());
  const changedFilter = Object.keys(updates).some((key) => key !== "page");

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }

  if (changedFilter && !Object.hasOwn(updates, "page")) {
    params.set("page", "1");
  }

  return params.toString();
}

export function readQuery(
  searchParams: URLSearchParams,
  keys: string[],
): Record<string, string> {
  return Object.fromEntries(
    keys.flatMap((key) => {
      const value = searchParams.get(key);
      return value ? [[key, value]] : [];
    }),
  );
}

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [value, delayMs]);

  return debouncedValue;
}
