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

type AdminShellContextValue = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  toggleCollapsed: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);
const COLLAPSED_STORAGE_KEY = "bjs.admin.sidebar.collapsed";

export function AdminShellProvider({ children }: { children: ReactNode }) {
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
    <AdminShellContext.Provider
      value={{
        open,
        setOpen,
        collapsed,
        setCollapsed,
        toggleCollapsed: () => setCollapsed((current) => !current),
      }}
    >
      {children}
    </AdminShellContext.Provider>
  );
}

export function useAdminShell() {
  const context = useContext(AdminShellContext);

  if (!context) {
    throw new Error("useAdminShell must be used inside AdminShellProvider");
  }

  return context;
}
