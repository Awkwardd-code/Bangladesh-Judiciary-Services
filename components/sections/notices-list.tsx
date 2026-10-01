import Link from "next/link";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type NoticeTag = "Update" | "Exam" | "Course" | "General";

type Notice = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  tag: NoticeTag;
};

// PLACEHOLDER — replace before launch. All notice content is static for now.
const notices: Notice[] = [
  {
    id: "preliminary-mock-01",
    date: "27 September 2026",
    title: "Registration for Preliminary Mock 01 is now open.",
    excerpt: "Enrollment for the first Preliminary model test closes on 5 October.",
    tag: "Exam",
  },
  {
    id: "october-schedule",
    date: "22 September 2026",
    title: "Model test schedule for October published.",
    excerpt:
      "Full October schedule including Preliminary and Written mocks is now available on the platform.",
    tag: "Course",
  },
  {
    id: "reading-materials",
    date: "18 September 2026",
    title: "New reading materials uploaded.",
    excerpt:
      "Fresh notes on Criminal Procedure Code have been added to the Materials section.",
    tag: "Update",
  },
  {
    id: "feedback-sessions",
    date: "12 September 2026",
    title: "Mentor feedback sessions begin next week.",
    excerpt:
      "Written test feedback sessions will be scheduled weekly for enrolled students.",
    tag: "General",
  },
  {
    id: "payment-methods",
    date: "05 September 2026",
    title: "Payment methods expanded.",
    excerpt: "You can now pay using bKash, Nagad, and bank transfer.",
    tag: "Update",
  },
  {
    id: "welcome",
    date: "28 August 2026",
    title: "Welcome to BJS Prep.",
    excerpt:
      "An introduction to the platform, our mission, and what you can expect.",
    tag: "General",
  },
];

export function NoticesList() {
  return (
    <section className="bg-cream px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {notices.length > 0 ? (
          notices.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
        ) : (
          <Card className="p-8 text-center">
            <Bell className="mx-auto text-accent" size={32} />
            <h2 className="mt-4 font-heading text-xl font-bold text-primary">
              No notices yet.
            </h2>
            <p className="mt-2 text-sm text-muted">
              New announcements will appear here when they are published.
            </p>
          </Card>
        )}

        <p className="sr-only">
          NOTE: empty state included for when the data source is swapped to a
          real API later.
        </p>
      </div>
    </section>
  );
}

function NoticeCard({ notice }: { notice: Notice }) {
  return (
    <article
      className="
        mb-4 rounded-lg border border-border bg-card p-5 shadow-sm
        transition-shadow hover:shadow-md sm:p-6
      "
    >
      <div
        className="
          flex flex-col items-start gap-2 sm:flex-row sm:items-center
          sm:gap-3
        "
      >
        <Badge className="border-accent text-xs text-accent">{notice.tag}</Badge>
        <span className="text-xs text-muted">{notice.date}</span>
      </div>
      <h2 className="mt-3 font-heading text-lg font-semibold text-primary">
        {notice.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">{notice.excerpt}</p>
      <Link
        href="#"
        className="
          mt-4 flex w-full justify-end text-sm text-accent hover:underline
          sm:inline-flex sm:w-auto sm:justify-start
        "
      >
        Read more →
      </Link>
    </article>
  );
}
