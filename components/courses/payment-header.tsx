export function PaymentHeader({
  course,
}: {
  course: {
    title: string;
    category: string;
  };
}) {
  return (
    <header className="bg-cream py-16 lg:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-sm text-muted">
          Home / Courses / {course.category} / Payment
        </div>

        <p className="mt-6 font-sans text-[12px] font-medium uppercase tracking-[0.2em] text-accent">
          Complete payment
        </p>

        <h1 className="mt-3 font-heading text-3xl font-bold text-primary lg:text-4xl">
          {course.title}
        </h1>

        <p className="mt-3 max-w-2xl text-base text-muted">
          Choose a payment method, send the amount, and submit the transaction
          details below.
        </p>
      </div>
    </header>
  );
}
