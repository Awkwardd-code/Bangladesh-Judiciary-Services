"use client";

import { useState, type ReactNode } from "react";

export function Dialog({
  trigger,
  children,
}: {
  trigger: (open: () => void) => ReactNode;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      {trigger(() => setIsOpen(true))}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Intro Video"
          className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center bg-primary-dark/80 p-5"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-2xl cursor-default rounded-xl bg-primary-dark p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex aspect-video items-center justify-center border border-white/10 text-sm text-cream/60">
              Intro Video
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center text-sm text-cream/70 hover:text-cream"
            >
              Close
            </button>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
