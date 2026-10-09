import {
  SkBadge,
  SkButton,
  SkHeading,
  SkLine,
  SkSquare,
} from "@/components/skeletons/primitives";

const columnWidths = [
  "w-3/4",
  "w-1/2",
  "w-2/3",
  "w-5/6",
  "w-1/3",
  "w-3/5",
  "w-1/2",
];

export function AdminStudentsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <SkHeading width="w-48" />
      </header>

      <div
        className="
          mt-6 flex flex-col gap-3 rounded-lg border border-border bg-card p-4
          md:flex-row
        "
      >
        <SkButton width="w-full lg:w-72" height="h-10" className="flex-1" />
        {Array.from({ length: 3 }, (_, index) => (
          <SkButton key={index} width="w-full md:w-44" height="h-10" />
        ))}
        <SkButton width="w-32" height="h-10" />
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
        <div
          className="
            hidden grid-cols-12 gap-4 border-b border-border px-6 py-3 md:grid
          "
        >
          {columnWidths.map((width, index) => (
            <SkLine
              key={index}
              width={width}
              className={
                index === 0
                  ? "col-span-3"
                  : index === 1
                    ? "col-span-2"
                    : index === 2
                      ? "col-span-3"
                      : "col-span-1"
              }
            />
          ))}
        </div>

        <AdminStudentsRowsSkeleton />
      </div>
    </div>
  );
}

export function AdminStudentsRowsSkeleton() {
  return (
    <div className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: 10 }, (_, rowIndex) => (
        <div
          key={rowIndex}
          className="
            grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-12 md:items-center
            md:gap-4 md:px-6
          "
        >
          <div className="space-y-2 md:col-span-3">
            <SkLine width="w-3/4" height="h-4" />
            <SkLine width="w-1/2" />
          </div>
          <SkLine
            width="w-1/2 md:w-3/4"
            height="h-4"
            className="md:col-span-2"
          />
          <SkLine
            width="w-2/3 md:w-5/6"
            height="h-4"
            className="md:col-span-3"
          />
          <SkBadge className="md:col-span-1" />
          <SkBadge className="md:col-span-1" />
          <SkLine
            width="w-1/3 md:w-2/3"
            height="h-4"
            className="md:col-span-1"
          />
          <div className="flex justify-end md:col-span-1">
            <SkSquare size="w-9 h-9" />
          </div>
        </div>
      ))}
    </div>
  );
}
