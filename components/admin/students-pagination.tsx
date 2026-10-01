export function StudentsPagination() {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-sm text-muted sm:text-left">
        Showing 1–10 of 143
      </p>
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <button
          type="button"
          disabled
          className="
            h-10 min-h-10 min-w-10 rounded-md border border-border px-4
            text-sm text-muted opacity-60 sm:h-9 sm:min-h-0 sm:min-w-0
          "
        >
          Previous
        </button>
        <button
          type="button"
          className="
            h-10 w-10 min-h-10 min-w-10 rounded-md bg-primary text-sm
            text-cream sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0
          "
        >
          1
        </button>
        <button
          type="button"
          className="
            h-10 w-10 min-h-10 min-w-10 rounded-md border border-border
            text-sm text-foreground hover:bg-primary/5 sm:h-9 sm:w-9
            sm:min-h-0 sm:min-w-0
          "
        >
          2
        </button>
        <button
          type="button"
          className="
            h-10 w-10 min-h-10 min-w-10 rounded-md border border-border
            text-sm text-foreground hover:bg-primary/5 sm:h-9 sm:w-9
            sm:min-h-0 sm:min-w-0
          "
        >
          3
        </button>
        <button
          type="button"
          className="
            h-10 min-h-10 min-w-10 rounded-md border border-border px-4
            text-sm text-foreground hover:bg-primary/5 sm:h-9
            sm:min-h-0 sm:min-w-0
          "
        >
          Next
        </button>
      </div>
      <p className="sr-only">
        NOTE: static pagination — wire to URL page param later.
      </p>
    </div>
  );
}
