"use client";

import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type FilterSelectProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
};

export function FilterSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  className,
  "aria-label": ariaLabel,
}: FilterSelectProps) {
  return (
    <Select
      id={id}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      aria-label={ariaLabel ?? placeholder ?? "Filter"}
      className={cn("h-10 w-full sm:w-44", className)}
    >
      {placeholder ? <option value="all">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
