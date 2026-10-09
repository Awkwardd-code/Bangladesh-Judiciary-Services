import { SkLine } from "@/components/skeletons/primitives";

type TableRowsSkeletonProps = {
  rows?: number;
  columns: number;
  widths?: string[];
};

const defaultWidths = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-1/3", "w-3/5"];

export function TableRowsSkeleton({
  rows = 8,
  columns,
  widths = defaultWidths,
}: TableRowsSkeletonProps) {
  const columnWidths = Array.from(
    { length: columns },
    (_, index) => widths[index % widths.length] ?? "w-2/3"
  );

  return (
    <div aria-hidden="true">
      <div
        className="grid gap-4 border-b border-border px-4 py-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {columnWidths.map((width, index) => (
          <SkLine
            key={index}
            width={width}
            height="h-3"
            className="opacity-80"
          />
        ))}
      </div>

      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 px-4 py-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {columnWidths.map((width, columnIndex) => (
              <SkLine key={columnIndex} width={width} height="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
