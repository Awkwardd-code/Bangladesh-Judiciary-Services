export function RegisterVisualPanel() {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-primary p-10 xl:p-14">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-gradient-to-b from-primary/40 via-primary/75 to-primary"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] [background:radial-gradient(ellipse_at_center,transparent_30%,rgba(10,20,40,0.6)_100%)]"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div>
          <div className="h-px w-10 bg-accent" />
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.25em] text-cream/70">
            BANGLADESH JUDICIAL SERVICE
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="max-w-md">
            <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-cream xl:text-5xl">
              From campus
              <br />
              to the courtroom.
            </h1>

            <div className="mt-6 h-px w-16 bg-accent" />

            <p className="mt-6 max-w-sm text-base leading-relaxed text-cream/80">
              A structured path for the next generation of Bangladesh&apos;s
              judiciary. Courses, model tests, and mentor-led review — all in
              one place.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-6 w-px bg-accent/60" />
          <div className="flex flex-col">
            <span className="text-[12px] uppercase tracking-widest text-cream/60">
              EST. 2025
            </span>
            <span className="text-[12px] text-cream/45">
              Rajshahi · Dhaka
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterVisualPanel;