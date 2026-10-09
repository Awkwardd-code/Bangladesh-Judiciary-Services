import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
type PublicExam = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  examType: "preliminary" | "written";
};

export function ModelTestsList({ exams }: { exams: PublicExam[] }) {
  return (
    <section className="bg-cream px-4 py-12 sm:px-6 md:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-accent">
          All tests
        </p>
        <h2 className="mt-3 font-heading text-2xl font-bold text-primary lg:text-4xl">
          Browse every available test.
        </h2>
        <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-2 lg:gap-8">
          {exams.map((exam) => (
            <Card key={exam.id} className="p-6">
              <div
                className="
                  flex flex-wrap items-start justify-between gap-3
                  lg:flex-nowrap lg:gap-0
                "
              >
                <Badge className="border-accent text-accent">
                  {exam.examType}
                </Badge>
              </div>
              <h3 className="mt-3 text-[17px] font-semibold text-primary">
                {exam.title}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {exam.description || `${exam.totalQuestions} questions · ${exam.durationMinutes} minutes`}
              </p>
              <div className="my-4 h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted">
                  <Users size={15} />
                  {exam.totalMarks} marks
                </span>
                <Link
                  href={
                    exam.examType === "preliminary"
                      ? `/exam/preliminary/${exam.id}`
                      : `/exam/written/${exam.id}`
                  }
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  Start Test <ArrowRight size={15} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
        {exams.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted">
            No published tests match your filters.
          </p>
        ) : null}
      </div>
    </section>
  );
}
