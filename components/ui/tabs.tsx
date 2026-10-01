"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const TabsContext = createContext<{
  value: string;
  setValue: (value: string) => void;
} | null>(null);

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;
  const setValue = (nextValue: string) => {
    setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      {children}
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 rounded-md border border-border p-1">
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsTrigger must be used inside Tabs");
  }

  return (
    <button
      type="button"
      onClick={() => context.setValue(value)}
      className={cnTab(context.value === value)}
      aria-selected={context.value === value}
      role="tab"
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);

  if (!context || context.value !== value) {
    return null;
  }

  return <div role="tabpanel">{children}</div>;
}

function cnTab(active: boolean) {
  return active
    ? "cursor-pointer rounded px-3 py-2 text-sm font-medium text-cream bg-primary"
    : "cursor-pointer rounded px-3 py-2 text-sm font-medium text-muted hover:text-primary";
}
