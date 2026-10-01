"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type DashboardShellContextValue = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  toggleCollapsed: () => void;
};

const COLLAPSED_STORAGE_KEY = "bjs.sidebar.collapsed";

const DashboardShellContext = createContext<DashboardShellContextValue | null>(
  null,
);

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true");
    } catch {
      setCollapsed(false);
    }

    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
    } catch {
      // Ignore unavailable local storage.
    }
  }, [collapsed, storageReady]);

  return (
    <DashboardShellContext.Provider
      value={{
        open,
        setOpen,
        collapsed,
        setCollapsed,
        toggleCollapsed: () => setCollapsed((current) => !current),
      }}
    >
      {children}
    </DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  const context = useContext(DashboardShellContext);

  if (!context) {
    throw new Error(
      "useDashboardShell must be used inside DashboardShellProvider",
    );
  }

  return context;
}
