import { Card } from "@/components/ui/card";
import {
  SkButton,
  SkCircle,
  SkHeading,
  SkLine,
} from "@/components/skeletons/primitives";

export function VerificationPageSkeleton() {
  return (
    <Card className="mx-auto w-full max-w-md space-y-5 border-border bg-card p-6 text-center sm:p-8">
      <SkCircle className="mx-auto" size="w-12 h-12" tone="copper" />
      <SkHeading className="mx-auto" width="w-3/4" />
      <SkLine />
      <SkLine className="mx-auto" width="w-5/6" />
      <SkButton className="mx-auto" width="w-full" height="h-11" />
    </Card>
  );
}
