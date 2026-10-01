"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/lib/query-params";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debouncedValue = useDebouncedValue(draft, debounceMs);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChangeRef.current(debouncedValue);
    }
  }, [debouncedValue, value]);

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="h-10 w-full pl-9 pr-9"
      />
      {draft ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setDraft("")}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted hover:bg-primary/5 hover:text-primary"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
