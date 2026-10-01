"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonWithIconProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children"
> & {
  icon: LucideIcon;
  iconPosition?: "left" | "right";
  children: ReactNode;
  href?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
};

export function ButtonWithIcon({
  icon: Icon,
  iconPosition = "left",
  children,
  className,
  variant = "default",
  size = "default",
  href,
  ...props
}: ButtonWithIconProps) {
  const variantClasses = {
    default: "bg-primary text-cream hover:bg-primary-dark",
    secondary: "bg-accent text-cream hover:bg-accent/90",
    outline: "border border-border bg-transparent text-primary hover:bg-primary/5",
    ghost: "bg-transparent text-primary hover:bg-primary/5",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  const sizeClasses = {
    default: "h-10 px-4",
    sm: "h-9 px-3 text-xs",
    lg: "h-11 px-5",
    icon: "h-10 w-10 p-0",
  }[size];
  const icon = (
    <Icon
      aria-hidden="true"
      size={16}
      strokeWidth={2}
      className="shrink-0"
    />
  );

  return (
    <Button
      {...props}
      href={href}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-md",
        variantClasses,
        sizeClasses,
        className,
      )}
    >
      {iconPosition === "left" ? icon : null}
      {children}
      {iconPosition === "right" ? icon : null}
    </Button>
  );
}
