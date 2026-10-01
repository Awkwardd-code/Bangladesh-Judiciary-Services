import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
const categories = ["All", "Preliminary", "Written", "Viva", "Foundation"];
export function CoursesFilter() {
  return (
    <section className="bg-cream px-4 pb-4 pt-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div
          className="
            -mx-4 flex flex-nowrap gap-2 overflow-x-auto px-4
            sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0
          "
        >
          {categories.map((category, index) => (
            <Badge
              key={category}
              className={
                index === 0
                  ? "whitespace-nowrap border-primary bg-primary text-cream"
                  : "whitespace-nowrap border-border text-muted"
              }
            >
              {category}
            </Badge>
          ))}
        </div>
        <Select
          aria-label="Sort courses"
          defaultValue="newest"
          className="w-full sm:w-48"
        >
          <option value="newest">Newest</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </Select>
      </div>
      <p className="sr-only">
        NOTE: static filter UI — wire to URL query params in a later pass.
      </p>
    </section>
  );
}
