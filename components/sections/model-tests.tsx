import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
export function ModelTests() {
  return (
    <section className="bg-primary-dark py-12 text-cream md:py-20 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-accent">
            Model tests
          </p>
          <h2 className="mt-3 max-w-md font-heading text-3xl font-bold lg:text-[40px]">
            Check your preparation with real exam simulations.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-cream/80">
            Check your preparation with real exam simulation for Bangladeshi
            Judicial Service exam solutions.
          </p>
          <Button
            href="/model-tests"
            className="
              mt-8 w-full border border-accent bg-transparent text-accent
              hover:bg-accent hover:text-primary-dark sm:w-auto
            "
          >
            Try a Model Test
          </Button>
        </div>
        <div className="ml-auto w-full max-w-md rounded-xl bg-card p-5 text-primary shadow-xl sm:p-6">
          <div className="flex items-center justify-between">
            <Badge className="border-accent text-accent">Preliminary</Badge>
            <span className="flex items-center gap-1 text-xs text-muted">
              <Clock size={14} /> 180 min
            </span>
          </div>
          <h3 className="mt-4 text-[17px] font-semibold">
            Criminal Procedure Code
          </h3>
          <p className="mt-1 text-sm text-muted">
            100 questions · Full syllabus
          </p>
          <div className="my-4 h-px bg-border" />
          <div
            className="
              flex flex-col items-stretch gap-3
              sm:flex-row sm:items-center sm:justify-between
            "
          >
            <Button
              href="/model-tests"
              className="
                h-9 w-full rounded-md bg-primary px-4 text-cream
                hover:bg-primary-dark sm:w-auto
              "
            >
              Start Test
            </Button>
            <Link
              href="/model-tests"
              className="text-center text-sm text-muted hover:text-primary"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
