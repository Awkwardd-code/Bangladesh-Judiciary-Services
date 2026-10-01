"use client";

import { useEffect, useState } from "react";

type ToastNotice = {
  id: number;
  message: string;
  type: "success" | "error";
};

type ToastEventDetail = Omit<ToastNotice, "id">;

export function toast(
  message: string,
  type: ToastEventDetail["type"] = "success",
) {
  window.dispatchEvent(
    new CustomEvent<ToastEventDetail>("bjs-toast", {
      detail: { message, type },
    }),
  );
}

export function Toaster() {
  const [notice, setNotice] = useState<ToastNotice | null>(null);

  useEffect(() => {
    let nextId = 0;
    let timeout: number | undefined;

    function showToast(event: Event) {
      const detail = (event as CustomEvent<ToastEventDetail>).detail;
      const id = ++nextId;

      window.clearTimeout(timeout);
      setNotice({ ...detail, id });
      timeout = window.setTimeout(() => setNotice(null), 4000);
    }

    window.addEventListener("bjs-toast", showToast);

    return () => {
      window.removeEventListener("bjs-toast", showToast);
      window.clearTimeout(timeout);
    };
  }, []);

  if (!notice) {
    return null;
  }

  return (
    <div
      aria-live={notice.type === "error" ? "assertive" : "polite"}
      className="fixed right-4 top-20 z-[80] max-w-sm"
    >
      <div
        role={notice.type === "error" ? "alert" : "status"}
        className={`
          flex items-start gap-3 rounded-md border bg-card px-4 py-3 shadow-lg
          ${notice.type === "error" ? "border-red-300" : "border-border"}
        `}
      >
        <p className="flex-1 text-sm text-foreground">{notice.message}</p>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => setNotice(null)}
          className="cursor-pointer text-sm text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Close
        </button>
      </div>
    </div>
  );
}
