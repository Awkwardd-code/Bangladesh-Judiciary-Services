import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  UserRoundPlus,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Choose a program",
    description:
      "Find a course or model test batch that fits your preparation goal.",
  },
  {
    number: "02",
    icon: UserRoundPlus,
    title: "Create your account",
    description:
      "Sign up to enroll and keep your learning activity in one place.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Complete enrollment",
    description:
      "Free offerings enroll directly; paid offerings ask for transaction details.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Start learning",
    description:
      "For paid enrollments, access opens after the transaction is reviewed.",
  },
];

export function HowToEnroll() {
  return (
    <section className="bg-background px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="h-px w-6 bg-accent/70" aria-hidden="true" />
            Simple to get started
            <span className="h-px w-6 bg-accent/70" aria-hidden="true" />
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary lg:text-4xl">
            Your next step, made clear
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            Go from choosing a learning path to accessing your enrolled course.
          </p>
        </header>

        <div className="relative mt-10 lg:mt-12">
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-border lg:block"
          />
          <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li
                key={step.number}
                className="group rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-cream shadow-sm transition-colors group-hover:bg-accent group-hover:text-primary-dark">
                    <step.icon size={21} aria-hidden="true" />
                  </span>
                  <span className="font-heading text-sm font-bold tracking-[0.16em] text-accent">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent"
          >
            Explore available courses{" "}
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
