import { Accordion } from "@/components/ui/accordion";

const items = [
  {
    question: "How do I enroll in a course?",
    answer:
      "Create an account, browse courses, and complete enrollment from your dashboard. Paid courses require admin approval after payment.",
  },
  {
    question: "Are the model tests timed like the real exam?",
    answer:
      "Yes. Every model test runs on the actual exam clock and mirrors the official paper pattern.",
  },
  {
    question: "Will someone review my written answers?",
    answer:
      "Written scripts are reviewed by faculty and returned with per-question feedback.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bKash, Nagad, and bank transfer. Payment details are shared after enrollment.",
  },
  {
    question: "Can I access the courses on mobile?",
    answer: "Yes. The platform is fully responsive and works on any device.",
  },
];
export function ContactFaq() {
  return (
    <section className="bg-cream px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted">
            Quick answers before you reach out.
          </p>
        </div>
        <div className="mt-12">
          <Accordion items={items} />
        </div>
      </div>
    </section>
  );
}
