import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function WrittenSubmissionResult({
  title,
  status,
  score,
  maxScore,
  submittedAt,
  answersPdfUrl,
  feedback,
}: {
  title: string;
  status: string;
  score: number;
  maxScore: number;
  submittedAt: Date | null;
  answersPdfUrl: string;
  feedback?: string;
}) {
  const isGraded = status === "graded";
  const percent =
    maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <Card className="border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">
              Written exam result
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-primary">
              {title}
            </h1>
          </div>
          <Badge className="border-accent text-accent">
            {status.replace("-", " ")}
          </Badge>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Summary label="Score" value={isGraded ? `${score}/${maxScore}` : "Pending"} />
          <Summary label="Percentage" value={isGraded ? `${percent}%` : "Pending"} />
          <Summary
            label="Submitted"
            value={submittedAt ? submittedAt.toLocaleString("en") : "—"}
          />
        </div>
        {feedback ? (
          <div className="mt-5 rounded-md border border-border bg-muted/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Examiner feedback
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
              {feedback}
            </p>
          </div>
        ) : null}
      </Card>
      <Card className="border-border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold text-primary">
          Submitted answer
        </h2>
        <a
          href={answersPdfUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm text-primary underline"
        >
          View uploaded answer PDF
        </a>
      </Card>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-heading text-lg font-semibold text-primary">
        {value}
      </p>
    </div>
  );
}
