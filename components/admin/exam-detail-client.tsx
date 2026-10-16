"use client";

import Link from "next/link";
import {
  ArchiveRestore,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Globe,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ExamPlanEditor } from "@/components/admin/exam-plan-editor";
import { AdminExamDetailSkeleton } from "@/components/skeletons/admin-exam-detail-skeleton";
import { ExamLifecycleBar } from "@/components/admin/exam-lifecycle-bar";
import { ExamReadinessCard } from "@/components/admin/exam-readiness-card";
import { ExamEditor } from "@/components/admin/exam-editor";
import { ImportExcelDialog } from "@/components/admin/import-excel-dialog";
import { QuestionEditor } from "@/components/admin/question-editor";
import { examTabClass } from "@/components/admin/exam-settings-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import type { SerializedExamSegment } from "@/lib/types/exam";

export type AdminExamQuestion = {
  _id: string;
  order: number;
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  marks: number;
  maxMarks?: number;
  subject?: string;
  explanation?: string;
};
export type AdminExamDetail = {
  _id: string;
  courseId: string;
  segmentId: string;
  subSegmentId: string;
  kind: "preliminary" | "written";
  title: string;
  description?: string;
  status: "draft" | "published" | "archived";
  type?: "free" | "paid";
  price?: number;
  discountedPrice?: number;
  validityMonths?: number;
  discountTill?: string | Date;
  purchaseMode?: "complete" | "specific";
  totalQuestions: number;
  totalMarks: number;
  questionsPerAttempt?: number;
  durationMinutes: number;
  passMarkPercent?: number;
  negativeMarking?: number;
  scheduledAt?: string | Date;
  closesAt?: string | Date;
  order?: number;
  segments?: SerializedExamSegment[];
};

type Attempt = {
  id: string;
  status: string;
  submittedAt: string | null;
  score: number;
  maxScore: number;
  user: { name: string; email: string } | null;
};

function toLocalDateTime(value?: string | Date) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export function ExamDetailClient({
  examId,
  initialExam,
  initialQuestions,
  initialTab = "questions",
}: {
  examId: string;
  initialExam: AdminExamDetail;
  initialQuestions: AdminExamQuestion[];
  initialTab?: "overview" | "plan" | "questions" | "settings" | "attempts";
}) {
  const [exam, setExam] = useState<AdminExamDetail | null>(initialExam);
  const [questions, setQuestions] =
    useState<AdminExamQuestion[]>(initialQuestions);
  const [segments, setSegments] = useState<SerializedExamSegment[]>(
    initialExam.segments ?? [],
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "plan" | "questions" | "settings" | "attempts"
  >(initialTab);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [savingPlan, setSavingPlan] = useState(false);

  const tabs = ["overview", "plan", "questions", "settings", "attempts"] as const;

  const planQuestions = questions.map((question) => ({
    id: question._id,
    questionText: question.questionText,
    kind:
      question.options && question.options.length > 0
        ? ("preliminary" as const)
        : ("written" as const),
    marks: question.marks ?? 1,
    subject: question.subject,
  }));

  function updateExam<K extends keyof AdminExamDetail>(
    key: K,
    value: AdminExamDetail[K],
  ) {
    setExam((current) =>
      current ? { ...current, [key]: value } : current,
    );
  }

  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/exams/${examId}`);
    const result = (await response.json()) as {
      data?: {
        exam?: AdminExamDetail;
        questions?: AdminExamQuestion[];
      };
    };

    const nextExam = result.data?.exam ?? null;
    setExam(nextExam);
    setQuestions(result.data?.questions ?? []);
    setSegments(nextExam?.segments ?? initialExam.segments ?? []);
  }, [examId, initialExam.segments]);

  useEffect(() => {
    if (!exam) {
      return;
    }

    setSegments(exam.segments ?? []);
  }, [exam]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (activeTab !== "attempts") {
      return;
    }

    let cancelled = false;

    async function loadAttempts() {
      try {
        const response = await fetch(
          `/api/admin/exams/${examId}/attempts`
        );
        const result = (await response.json()) as {
          error?: string;
          data?: { attempts?: Attempt[] };
        };

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load exam attempts.");
        }

        if (!cancelled) {
          setAttempts(result.data?.attempts ?? []);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load exam attempts."
          );
        }
      }
    }

    void loadAttempts();

    return () => {
      cancelled = true;
    };
  }, [activeTab, examId]);

  async function handleSaveOverview() {
    if (!exam) {
      return;
    }
    setError("");

    try {
      const response = await fetch(`/api/admin/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: exam.title.trim(),
          description: exam.description?.trim() ?? "",
          kind: exam.kind,
          type: exam.type ?? "paid",
          price: Number(exam.price ?? 0),
          discountedPrice: exam.discountedPrice,
          validityMonths: Number(exam.validityMonths ?? 12),
          discountTill: exam.discountTill
            ? new Date(exam.discountTill).toISOString()
            : undefined,
          purchaseMode: exam.purchaseMode ?? "complete",
          durationMinutes: Number(exam.durationMinutes),
          passMarkPercent: Number(exam.passMarkPercent ?? 50),
          negativeMarking: Number(exam.negativeMarking ?? 0),
          scheduledAt: exam.scheduledAt
            ? new Date(exam.scheduledAt).toISOString()
            : undefined,
          closesAt: exam.closesAt
            ? new Date(exam.closesAt).toISOString()
            : undefined,
          order: Number(exam.order ?? 0),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        data?: { exam?: AdminExamDetail };
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save exam overview.");
      }

      await load();
      toast("Overview saved.", "success");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save exam overview.";
      setError(message);
      toast(message, "error");
    }
  }

  async function handleSavePlan() {
    setSavingPlan(true);

    try {
      const response = await fetch(`/api/admin/exams/${examId}/segments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments }),
      });
      const result = (await response.json()) as {
        error?: string;
        data?: { segments?: SerializedExamSegment[] };
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save exam plan.");
      }

      const nextSegments = result.data?.segments ?? segments;
      setSegments(nextSegments);
      await load();
      toast("Plan saved.");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save exam plan.";
      setError(message);
      toast(message, "error");
    } finally {
      setSavingPlan(false);
    }
  }

  function openQuestionEditor(item?: AdminExamQuestion) {
    setEditingQuestionId(item?._id ?? null);
    setFormOpen(true);
  }

  async function removeQuestion(id: string) {
    if (window.confirm("Delete this question?")) {
      const response = await fetch(
        `/api/admin/exams/${examId}/questions/${id}`,
        { method: "DELETE" }
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Unable to delete question.");
        return;
      }

      await load();
    }
  }

  async function moveQuestion(item: AdminExamQuestion, direction: -1 | 1) {
    const index = questions.findIndex(
      (questionItem) => questionItem._id === item._id
    );
    const target = questions[index + direction];

    if (!target) {
      return;
    }

    const temporaryOrder =
      Math.max(...questions.map((entry) => entry.order)) + 1;
    const changes = [
      { question: item, order: temporaryOrder },
      { question: target, order: item.order },
      { question: item, order: target.order },
    ];

    for (const change of changes) {
      const response = await fetch(
        `/api/admin/exams/${examId}/questions/${change.question._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: change.order }),
        }
      );

      if (!response.ok) {
        setError("Unable to reorder questions.");
        return;
      }
    }

    await load();
  }

  async function changeStatus() {
    const nextStatus =
      exam?.status === "published"
        ? "draft"
        : exam?.status === "archived"
          ? "published"
          : "published";
    const response = await fetch(`/api/admin/exams/${examId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Unable to change exam status.");
      return;
    }

    await load();
  }

  if (!exam) return <AdminExamDetailSkeleton />;
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/exams" className="text-sm text-accent">
        ← Exams
      </Link>
      <div className="sticky top-0 z-30 mt-4 flex flex-col gap-3 border-b border-border bg-background/95 py-4 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            {exam.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {exam.totalQuestions}{" "}
            {exam.totalQuestions === 1 ? "question" : "questions"} ·{" "}
            {exam.totalMarks} marks · {exam.durationMinutes ?? 0} min
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/exam/${examId}`}
            target="_blank"
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          >
            <Eye size={16} />
            Preview
          </Link>
          <Button
            type="button"
            onClick={() => openQuestionEditor()}
            className="h-10 rounded-lg px-4"
          >
            <Plus size={16} />
            Add question
          </Button>
          {exam.kind === "preliminary" ? (
            <ImportExcelDialog
              examId={examId}
              kind="mcq"
              unifiedExam
              onImported={(count) => {
                void load();
                toast(`${count} questions imported.`, "success");
              }}
            />
          ) : null}
          <Button
            type="button"
            onClick={() => void changeStatus()}
            disabled={
              exam.status !== "published" &&
              questions.length < (exam.questionsPerAttempt ?? 1)
            }
            title={
              exam.status !== "published" &&
              questions.length < (exam.questionsPerAttempt ?? 1)
                ? `Add at least ${exam.questionsPerAttempt ?? 1} questions before publishing.`
                : undefined
            }
            variant={exam.status === "published" ? "ghost" : "default"}
            className="h-10 rounded-lg border border-border px-4"
          >
            {exam.status === "published" ? (
              <EyeOff size={16} />
            ) : exam.status === "archived" ? (
              <ArchiveRestore size={16} />
            ) : (
              <Globe size={16} />
            )}
            {exam.status === "published"
              ? "Unpublish"
              : exam.status === "archived"
                ? "Restore"
                : "Publish"}
          </Button>
        </div>
      </div>
      <div className="mt-5 space-y-5">
        <ExamLifecycleBar
          status={exam.status}
          totalQuestions={questions.length}
          requiredQuestions={exam.questionsPerAttempt ?? 1}
          hasCourse
        />
        <ExamReadinessCard
          totalQuestions={questions.length}
          requiredQuestions={exam.questionsPerAttempt ?? 1}
          hasCourse
        />
        {error ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={examTabClass(activeTab === tab)}
            >
              {{
                overview: "Overview",
                plan: "Plan",
                questions: "Questions",
                settings: "Settings",
                attempts: "Attempts",
              }[tab]}
            </button>
          ))}
        </div>
        {activeTab === "overview" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSaveOverview();
            }}
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-primary sm:col-span-2">
                <span>Title</span>
                <Input
                  className="cursor-pointer"
                  value={exam.title}
                  onChange={(event) =>
                    updateExam("title", event.target.value)
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-primary sm:col-span-2">
                <span>Description</span>
                <Textarea
                  className="cursor-pointer"
                  rows={3}
                  value={exam.description ?? ""}
                  onChange={(event) =>
                    updateExam("description", event.target.value)
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-primary">
                <span>Kind</span>
                <Select
                  className="w-full cursor-pointer"
                  value={exam.kind}
                  onChange={(event) =>
                    updateExam(
                      "kind",
                      event.target.value === "written"
                        ? "written"
                        : "preliminary",
                    )
                  }
                >
                  <option value="preliminary">Preliminary</option>
                  <option value="written">Written</option>
                </Select>
              </label>

              <label className="space-y-2 text-sm font-medium text-primary">
                <span>Type</span>
                <Select
                  className="w-full cursor-pointer"
                  value={exam.type ?? "paid"}
                  onChange={(event) =>
                    updateExam(
                      "type",
                      event.target.value === "free" ? "free" : "paid",
                    )
                  }
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </Select>
              </label>

              {exam.type === "paid" || !exam.type ? (
                <>
                  <label className="space-y-2 text-sm font-medium text-primary">
                    <span>Price</span>
                    <Input
                      className="cursor-pointer"
                      type="number"
                      min={0}
                      value={exam.price ?? 0}
                      onChange={(event) =>
                        updateExam("price", Number(event.target.value) || 0)
                      }
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-primary">
                    <span>Discounted price</span>
                    <Input
                      className="cursor-pointer"
                      type="number"
                      min={0}
                      value={exam.discountedPrice ?? ""}
                      onChange={(event) =>
                        updateExam(
                          "discountedPrice",
                          event.target.value === ""
                            ? undefined
                            : Number(event.target.value),
                        )
                      }
                    />
                  </label>
                </>
              ) : null}

              <label className="space-y-2 text-sm font-medium text-primary">
                <span>Validity months</span>
                <Input
                  className="cursor-pointer"
                  type="number"
                  min={1}
                  value={exam.validityMonths ?? 12}
                  onChange={(event) =>
                    updateExam(
                      "validityMonths",
                      Number(event.target.value) || 1,
                    )
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-primary">
                <span>Purchase mode</span>
                <Select
                  className="w-full cursor-pointer"
                  value={exam.purchaseMode ?? "complete"}
                  onChange={(event) =>
                    updateExam(
                      "purchaseMode",
                      event.target.value === "specific"
                        ? "specific"
                        : "complete",
                    )
                  }
                >
                  <option value="complete">Complete Series</option>
                  <option value="specific">Specific Test</option>
                </Select>
              </label>

              <label className="space-y-2 text-sm font-medium text-primary">
                <span>Duration (minutes)</span>
                <Input
                  className="cursor-pointer"
                  type="number"
                  min={1}
                  value={exam.durationMinutes}
                  onChange={(event) =>
                    updateExam(
                      "durationMinutes",
                      Number(event.target.value) || 0,
                    )
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-primary">
                <span>Pass mark</span>
                <Input
                  className="cursor-pointer"
                  type="number"
                  min={1}
                  max={100}
                  value={exam.passMarkPercent ?? 50}
                  onChange={(event) =>
                    updateExam(
                      "passMarkPercent",
                      Number(event.target.value) || 0,
                    )
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-primary">
                <span>Negative marking</span>
                <Input
                  className="cursor-pointer"
                  type="number"
                  min={0}
                  max={2}
                  step={0.25}
                  value={exam.negativeMarking ?? 0}
                  onChange={(event) =>
                    updateExam(
                      "negativeMarking",
                      Number(event.target.value) || 0,
                    )
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-primary">
                <span>Discount till</span>
                <Input
                  className="cursor-pointer"
                  type="datetime-local"
                  value={toLocalDateTime(exam.discountTill)}
                  onChange={(event) =>
                    updateExam(
                      "discountTill",
                      event.target.value || undefined,
                    )
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-primary">
                <span>Scheduled at</span>
                <Input
                  className="cursor-pointer"
                  type="datetime-local"
                  value={toLocalDateTime(exam.scheduledAt ?? undefined)}
                  onChange={(event) =>
                    updateExam(
                      "scheduledAt",
                      event.target.value || undefined,
                    )
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-primary">
                <span>Closes at</span>
                <Input
                  className="cursor-pointer"
                  type="datetime-local"
                  value={toLocalDateTime(exam.closesAt ?? undefined)}
                  onChange={(event) =>
                    updateExam("closesAt", event.target.value || undefined)
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-primary">
                <span>Order</span>
                <Input
                  className="cursor-pointer"
                  type="number"
                  value={exam.order ?? 0}
                  onChange={(event) =>
                    updateExam("order", Number(event.target.value) || 0)
                  }
                />
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save overview</Button>
            </div>
          </form>
        ) : activeTab === "plan" ? (
          <ExamPlanEditor
            segments={segments}
            questions={planQuestions}
            onChange={(next) => setSegments(next)}
            onSave={handleSavePlan}
            saving={savingPlan}
          />
        ) : activeTab === "settings" ? (
          <ExamEditor exam={exam} onSaved={() => void load()} />
        ) : activeTab === "attempts" ? (
          attempts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
              <p className="font-heading text-lg font-semibold text-primary">
                No attempts yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-background text-xs text-muted">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Submitted at</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-primary">
                          {attempt.user?.name ?? "Unknown student"}
                        </p>
                        <p className="text-xs text-muted">
                          {attempt.user?.email ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString()
                          : "Not submitted"}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {attempt.score} / {attempt.maxScore}
                      </td>
                      <td className="px-4 py-3 capitalize text-muted">
                        {exam.kind === "written" &&
                        attempt.status !== "in-progress" ? (
                          <Link
                            href={`/admin/exam-review/${attempt.id}`}
                            className="text-accent underline"
                          >
                            {attempt.status.replaceAll("-", " ")} · Review
                          </Link>
                        ) : (
                          attempt.status.replaceAll("-", " ")
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {questions.map((item, index) => (
              <article
                key={item._id}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:bg-primary/[0.02]"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium text-foreground">
                    {item.order}. {item.questionText}
                  </p>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label="Move question up"
                      disabled={index === 0}
                      onClick={() => void moveQuestion(item, -1)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label="Move question down"
                      disabled={index === questions.length - 1}
                      onClick={() => void moveQuestion(item, 1)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label="Edit question"
                      onClick={() => openQuestionEditor(item)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-primary/5"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete question"
                      onClick={() => void removeQuestion(item._id)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(item.options ?? []).map((option, index) => (
                    <li
                      key={option}
                      className={
                        index === item.correctOptionIndex
                          ? "border-l-2 border-accent bg-accent/10 p-2 text-sm"
                          : "p-2 text-sm text-muted"
                      }
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </li>
                  ))}
                </ol>
                {item.explanation ? (
                  <p className="mt-3 text-sm text-muted">{item.explanation}</p>
                ) : null}
              </article>
            ))}
            {questions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
                No questions yet.
              </div>
            ) : null}
          </div>
        )}
      </div>
      <QuestionEditor
        open={formOpen}
        kind={exam.kind}
        examId={examId}
        question={
          questions.find((item) => item._id === editingQuestionId) ?? null
        }
        nextOrder={Math.max(0, ...questions.map((item) => item.order)) + 1}
        onSave={() => void load()}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
