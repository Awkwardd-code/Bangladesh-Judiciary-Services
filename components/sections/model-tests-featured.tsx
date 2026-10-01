import { Clock, FileText, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
export function ModelTestsFeatured() {
  return (
    <section className="bg-primary-dark px-4 pb-12 text-cream sm:px-6 md:pb-20">
      <div className="mx-auto grid w-full max-w-4xl gap-6 rounded-xl border border-cream/15 bg-primary/70 p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <Badge className="border-transparent bg-accent text-[11px] font-semibold text-primary-dark">
            FEATURED
          </Badge>
          <h2 className="mt-4 font-heading text-2xl font-bold">
            Full Preliminary Mock 01
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-cream/75">
            A complete simulation built to mirror the pressure, pace, and
            breadth of the preliminary examination.
          </p>
          <div
            className="
              mt-6 flex flex-col gap-3 text-sm text-cream/75
              sm:flex-row sm:flex-wrap sm:gap-6
            "
          >
            <span className="flex items-center gap-2">
              <FileText size={17} className="text-accent" />
              100 questions
            </span>
            <span className="flex items-center gap-2">
              <Clock size={17} className="text-accent" />
              180 minutes
            </span>
            <span className="flex items-center gap-2">
              <Target size={17} className="text-accent" />
              Full syllabus
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <p className="font-heading text-3xl font-bold">BDT 500</p>
            <p className="mt-1 text-sm text-cream/60">One-time access</p>
          </div>
          <Button
            href="/model-tests/1"
            className="mt-4 w-full rounded-md bg-accent text-primary-dark hover:bg-cream"
          >
            Start Test
          </Button>
        </div>
      </div>
    </section>
  );
}
