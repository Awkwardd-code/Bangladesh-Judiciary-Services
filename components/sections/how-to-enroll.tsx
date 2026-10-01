const steps = [
  {
    number: "01",
    title: "Browse Courses",
    description: "Comprehensive fits to lead operation through courses.",
  },
  {
    number: "02",
    title: "Create Account",
    description: "Create your account and your account.",
  },
  {
    number: "03",
    title: "Enroll",
    description: "Enroll and unite platform to university courses.",
  },
  {
    number: "04",
    title: "Start Learning",
    description: "Start learning and examine every lesson now.",
  },
];

export function HowToEnroll() {
  return (
    <section className="bg-cream px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <h2 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            How to enroll
          </h2>
        </header>

        <div className="relative mt-12">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block"
          />
          <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step) => (
              <li key={step.number}>
                <span className="font-heading text-4xl font-extrabold leading-none text-accent">
                  {step.number}
                </span>
                <h3 className="mt-3 text-[15px] font-semibold text-primary">
                  {step.title}
                </h3>
                <p className="mt-1 max-w-xs text-[13px] leading-5 text-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
