import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  onCheckedChange?: (value: boolean) => void;
};

export function Checkbox({ className, onCheckedChange, onChange, checked, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      className={cn(
        "h-4 w-4 rounded border-border accent-primary focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
      onChange={(event) => {
        onChange?.(event);
        onCheckedChange?.(event.target.checked);
      }}
      {...props}
    />
  );
}
