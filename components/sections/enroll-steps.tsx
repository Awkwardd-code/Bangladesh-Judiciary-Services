const steps = [
  ["01", "Browse Courses", "Browse comprehensive courses that fit your goal."],
  ["02", "Create Account", "Create an account with your student details."],
  ["03", "Enroll", "Enroll in your selected course and complete enrollment."],
  [
    "04",
    "Start Learning",
    "Start learning at your own pace and access everything.",
  ],
];
export function EnrollSteps() {
  return (
    <section className="bg-cream py-12 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-heading text-3xl font-bold text-primary lg:text-[40px]">
          How to enroll
        </h2>
        <div
          className="
            relative mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-8
            lg:mt-16 lg:grid-cols-4 lg:gap-8
          "
        >
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-border lg:block" />
          <div className="absolute bottom-0 left-[17px] top-4 w-px bg-border sm:hidden" />
          {steps.map(([number, title, body]) => (
            <div
              key={number}
              className="relative flex items-start gap-4 sm:block"
            >
              <p className="shrink-0 font-heading text-4xl font-extrabold text-accent">
                {number}
              </p>
              <div>
                <h3 className="mt-1 text-base font-semibold text-primary sm:mt-3">
                  {title}
                </h3>
                <p className="mt-1 max-w-xs text-sm leading-6 text-muted">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
