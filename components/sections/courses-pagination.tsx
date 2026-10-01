export function CoursesPagination() {
  return (
    <section className="bg-cream px-4 pb-12 sm:px-6 md:pb-20">
      <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
        <button
          className="
            min-h-10 min-w-10 rounded-md px-3 py-2 text-sm text-muted
            hover:bg-card sm:min-h-0 sm:min-w-0 sm:px-4
          "
        >
          Previous
        </button>
        <button
          className="
            min-h-10 min-w-10 rounded-md bg-primary px-4 py-2 text-sm
            text-cream sm:min-h-0 sm:min-w-0
          "
        >
          1
        </button>
        <button
          className="
            min-h-10 min-w-10 rounded-md px-4 py-2 text-sm text-muted
            hover:bg-card sm:min-h-0 sm:min-w-0
          "
        >
          2
        </button>
        <button
          className="
            min-h-10 min-w-10 rounded-md px-4 py-2 text-sm text-muted
            hover:bg-card sm:min-h-0 sm:min-w-0
          "
        >
          3
        </button>
        <button
          className="
            min-h-10 min-w-10 rounded-md px-4 py-2 text-sm text-muted
            hover:bg-card sm:min-h-0 sm:min-w-0
          "
        >
          Next
        </button>
      </div>
      <p className="sr-only">
        NOTE: static pagination — wire to URL page param later.
      </p>
    </section>
  );
}
