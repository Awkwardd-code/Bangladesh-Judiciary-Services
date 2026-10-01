"use client";

import { Plus } from "lucide-react";

export function SuccessStoriesAdminHeader() {
  function openEditor() {
    window.dispatchEvent(new Event("open-success-story-editor"));
  }

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
          Success Stories
        </h1>
        <p className="mt-2 text-base text-muted">
          Curate, moderate, and publish student stories.
        </p>
      </div>
      <button
        type="button"
        onClick={openEditor}
        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-cream"
      >
        <Plus size={16} />
        Add story
      </button>
    </header>
  );
}
