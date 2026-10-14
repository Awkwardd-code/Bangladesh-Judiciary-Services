import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function SampleStoryNotice() {
  return (
    <Card
      role="note"
      className="border-amber-300 bg-amber-50 p-4 text-amber-950 sm:p-5"
    >
      <p className="font-semibold">Fictional demo stories</p>
      <p className="mt-1 text-sm leading-6">
        These sample names, images, quotes, and achievements are fictional
        examples used to demonstrate this page. They are not real students,
        testimonials, or selection results.
      </p>
    </Card>
  );
}

export function SampleStoryBadge() {
  return (
    <Badge className="border-amber-300 bg-amber-50 text-amber-900">
      Fictional sample
    </Badge>
  );
}
