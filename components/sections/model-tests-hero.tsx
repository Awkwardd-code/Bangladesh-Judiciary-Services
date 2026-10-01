import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export function ModelTestsHero() {
  return (
    <section className="bg-primary-dark px-4 py-12 text-center text-cream sm:px-6 md:py-20 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-accent">
          Model Tests
        </p>
        <h1 className="mt-4 font-heading text-3xl font-bold sm:text-4xl md:text-5xl lg:text-5xl">
          Simulate the real exam. Know exactly where you stand.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-cream/80 lg:text-lg lg:leading-8">
          Practice with exam-realistic timing, question patterns, and detailed
          performance review.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            href="/model-tests/trial"
            className="
              w-full bg-accent text-primary-dark hover:bg-cream sm:w-auto
            "
          >
            Start a Trial Test <ArrowUpRight size={17} />
          </Button>
          <Button
            href="/model-tests/all"
            className="min-h-11 w-full border border-cream bg-transparent text-cream hover:bg-cream/10 sm:w-auto"
          >
            View All Tests <ArrowUpRight size={17} />
          </Button>
        </div>
      </div>
    </section>
  );
}
