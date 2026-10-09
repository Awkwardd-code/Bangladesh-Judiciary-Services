"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  HelpCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  X,
} from "lucide-react";

import { ExamLifecycleBar } from "@/components/admin/exam-lifecycle-bar";
import { ExamReadinessCard } from "@/components/admin/exam-readiness-card";
import { AdminFreeTestEditorSkeleton } from "@/components/skeletons/admin-free-test-editor-skeleton";
import { toast } from "@/components/ui/toaster";
import type {
  ResolvedQuestion,
  SerializedFreeTest,
} from "@/lib/free-test-serializer";
import { plural } from "@/lib/pluralize";

type QuestionKindFilter = "preliminary" | "written";

type FreeTestEditorProps = {
  freeTest?: SerializedFreeTest | null;
  initialQuestions?: ResolvedQuestion[];
};

type FreeTestForm = {
  title: string;
  description: string;
  preliminaryDurationMinutes: number;
  writtenDurationMinutes: number;
  passMarkPercent: number;
  questionsPerAttempt: number;
  writtenQuestionsPerAttempt: number;
  order: number;
  scheduledAt: string;
  closesAt: string;
};

type FormFieldErrors = {
  title?: string;
  description?: string;
  questionsPerAttempt?: string;
  writtenQuestionsPerAttempt?: string;
};

const emptyForm: FreeTestForm = {
  title: "",
  description: "",
  preliminaryDurationMinutes: 45,
  writtenDurationMinutes: 0,
  passMarkPercent: 50,
  questionsPerAttempt: 0,
  writtenQuestionsPerAttempt: 0,
  order: 0,
  scheduledAt: "",
  closesAt: "",
};

const emptyQuestions: ResolvedQuestion[] = [];

function toInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
}

function toIsoString(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function normalizeBankQuestion(question: any): ResolvedQuestion {
  const sourceCollection =
    question?.sourceCollection === "written_questions"
      ? "written_questions"
      : "preliminary_questions";

  return {
    id: String(question?._id ?? question?.id ?? ""),
    sourceCollection,
    questionText: String(question?.questionText ?? ""),
    options: Array.isArray(question?.options)
      ? question.options.map((entry: unknown) => String(entry))
      : undefined,
    maxMarks:
      typeof question?.maxMarks === "number" ? question.maxMarks : undefined,
    marks: Number(question?.marks ?? question?.maxMarks ?? 0),
    subject: String(question?.subject ?? "General"),
  };
}

function getServingStatus(target: number, poolSize: number) {
  if (target === 0) {
    return {
      message: `Serving: all ${poolSize} ${poolSize === 1 ? "question" : "questions"}`,
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (target <= poolSize) {
    return {
      message: `Serving: ${target} of ${poolSize} ${poolSize === 1 ? "question" : "questions"}`,
      tone: "border-primary/20 bg-primary/5 text-primary",
    };
  }

  return {
    message: `Warning: ${target} exceeds pool size ${poolSize}. Only ${poolSize} will be served.`,
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  };
}

export function FreeTestEditor({
  freeTest,
  initialQuestions = emptyQuestions,
}: FreeTestEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(freeTest?.id);

  const [form, setForm] = useState<FreeTestForm>(() => {
    if (!freeTest) {
      return emptyForm;
    }

    return {
      title: freeTest.title,
      description: freeTest.description,
      preliminaryDurationMinutes: freeTest.preliminaryDurationMinutes,
      writtenDurationMinutes: freeTest.writtenDurationMinutes,
      passMarkPercent: freeTest.passMarkPercent,
      questionsPerAttempt: freeTest.questionsPerAttempt,
      writtenQuestionsPerAttempt: freeTest.writtenQuestionsPerAttempt,
      order: freeTest.order,
      scheduledAt: toInputValue(freeTest.scheduledAt),
      closesAt: toInputValue(freeTest.closesAt),
    };
  });
  const [selected, setSelected] =
    useState<ResolvedQuestion[]>(initialQuestions);
  const selectedPreliminaryCount = selected.filter(
    (question) => question.sourceCollection === "preliminary_questions"
  ).length;
  const selectedWrittenCount = selected.filter(
    (question) => question.sourceCollection === "written_questions"
  ).length;
  const requiredQuestions = Math.max(
    0,
    (selectedPreliminaryCount > 0
      ? Number(form.questionsPerAttempt) || selectedPreliminaryCount
      : 0) +
      (selectedWrittenCount > 0
        ? Number(form.writtenQuestionsPerAttempt) || selectedWrittenCount
        : 0)
  );
  const phasesReady =
    selected.length > 0 &&
    Number(form.preliminaryDurationMinutes) >= 0 &&
    Number(form.writtenDurationMinutes) >= 0 &&
    (Number(form.preliminaryDurationMinutes) === 0
      ? selectedPreliminaryCount === 0
      : selectedPreliminaryCount > 0 &&
        (Number(form.questionsPerAttempt) === 0 ||
          Number(form.questionsPerAttempt) <= selectedPreliminaryCount)) &&
    (Number(form.writtenDurationMinutes) === 0
      ? selectedWrittenCount === 0
      : selectedWrittenCount > 0 &&
        (Number(form.writtenQuestionsPerAttempt) === 0 ||
          Number(form.writtenQuestionsPerAttempt) <= selectedWrittenCount)) &&
    (Number(form.preliminaryDurationMinutes) > 0 ||
      Number(form.writtenDurationMinutes) > 0);
  const preliminaryServing = getServingStatus(
    Number(form.questionsPerAttempt),
    selectedPreliminaryCount
  );
  const writtenServing = getServingStatus(
    Number(form.writtenQuestionsPerAttempt),
    selectedWrittenCount
  );
  const [bank, setBank] = useState<ResolvedQuestion[]>([]);
  const [bankLoading, setBankLoading] = useState(true);
  const [bankError, setBankError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [kindFilter, setKindFilter] =
    useState<QuestionKindFilter>("preliminary");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldErrors = useMemo<FormFieldErrors>(() => {
    const nextErrors: FormFieldErrors = {};
    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      nextErrors.title = "Title is required.";
    } else if (title.length < 3) {
      nextErrors.title = "Title must be at least 3 characters long.";
    }

    if (!description) {
      nextErrors.description = "Description is required.";
    } else if (description.length < 10) {
      nextErrors.description =
        "Description must be at least 10 characters long.";
    }

    const perAttempt = Number(form.questionsPerAttempt);

    if (!Number.isInteger(perAttempt) || perAttempt < 0 || perAttempt > 500) {
      nextErrors.questionsPerAttempt =
        "Questions per attempt must be between 0 and 500.";
    } else if (
      selectedPreliminaryCount > 0 &&
      perAttempt > selectedPreliminaryCount
    ) {
      nextErrors.questionsPerAttempt = `Questions per attempt cannot exceed the ${selectedPreliminaryCount}-question preliminary pool.`;
    }

    const writtenPerAttempt = Number(form.writtenQuestionsPerAttempt);

    if (
      !Number.isInteger(writtenPerAttempt) ||
      writtenPerAttempt < 0 ||
      writtenPerAttempt > 500
    ) {
      nextErrors.writtenQuestionsPerAttempt =
        "Written questions per attempt must be between 0 and 500.";
    } else if (
      selectedWrittenCount > 0 &&
      writtenPerAttempt > selectedWrittenCount
    ) {
      nextErrors.writtenQuestionsPerAttempt = `Written questions per attempt cannot exceed the ${selectedWrittenCount}-question written pool.`;
    }

    return nextErrors;
  }, [
    form.description,
    form.questionsPerAttempt,
    form.title,
    form.writtenQuestionsPerAttempt,
    selectedPreliminaryCount,
    selectedWrittenCount,
  ]);

  const saveDisabled = saving;
  const readinessIssues = [
    Number(form.preliminaryDurationMinutes) > 0 &&
    selectedPreliminaryCount === 0
      ? "Select preliminary questions or remove the preliminary duration."
      : "",
    Number(form.writtenDurationMinutes) > 0 && selectedWrittenCount === 0
      ? "Select written questions or remove the written duration."
      : "",
    selectedPreliminaryCount > 0 && Number(form.preliminaryDurationMinutes) <= 0
      ? "Set a preliminary duration."
      : "",
    selectedWrittenCount > 0 && Number(form.writtenDurationMinutes) <= 0
      ? "Set a written duration."
      : "",
    selectedPreliminaryCount > 0 &&
    Number(form.questionsPerAttempt) > selectedPreliminaryCount
      ? "Reduce preliminary questions per attempt or add more questions."
      : "",
    selectedWrittenCount > 0 &&
    Number(form.writtenQuestionsPerAttempt) > selectedWrittenCount
      ? "Reduce written questions per attempt or add more questions."
      : "",
    Number(form.preliminaryDurationMinutes) === 0 &&
    Number(form.writtenDurationMinutes) === 0
      ? "Set at least one phase duration."
      : "",
    selected.length === 0 ? "Add at least one question." : "",
  ].filter(Boolean);

  useEffect(() => {
    if (!freeTest) {
      setForm(emptyForm);
      setSelected([]);
      return;
    }

    setForm({
      title: freeTest.title,
      description: freeTest.description,
      preliminaryDurationMinutes: freeTest.preliminaryDurationMinutes,
      writtenDurationMinutes: freeTest.writtenDurationMinutes,
      passMarkPercent: freeTest.passMarkPercent,
      questionsPerAttempt: freeTest.questionsPerAttempt,
      writtenQuestionsPerAttempt: freeTest.writtenQuestionsPerAttempt,
      order: freeTest.order,
      scheduledAt: toInputValue(freeTest.scheduledAt),
      closesAt: toInputValue(freeTest.closesAt),
    });
    setSelected(initialQuestions);
  }, [freeTest, initialQuestions]);

  useEffect(() => {
    async function loadBank() {
      try {
        setBankLoading(true);
        setBankError(null);

        const response = await fetch("/api/admin/question-bank?limit=500");

        if (!response.ok) {
          throw new Error("Unable to load the question bank.");
        }

        const result = await response.json();
        const questions = Array.isArray(result?.data?.questions)
          ? result.data.questions
          : Array.isArray(result?.questions)
            ? result.questions
            : [];

        setBank(questions.map(normalizeBankQuestion));
      } catch (loadError) {
        console.error("Load question bank error", loadError);
        setBankError("Unable to load the question bank right now.");
        setBank([]);
      } finally {
        setBankLoading(false);
      }
    }

    void loadBank();
  }, []);

  const subjectOptions = useMemo(() => {
    return Array.from(
      new Set(
        bank
          .filter(
            (question) =>
              (kindFilter === "preliminary" &&
                question.sourceCollection === "preliminary_questions") ||
              (kindFilter === "written" &&
                question.sourceCollection === "written_questions")
          )
          .map((question) => question.subject)
          .filter((subject) => Boolean(subject))
      )
    ).sort((left, right) => left.localeCompare(right));
  }, [bank, kindFilter]);

  const filteredBank = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return bank.filter((question) => {
      const matchesQuery =
        query.length === 0 ||
        question.questionText.toLowerCase().includes(query) ||
        question.subject.toLowerCase().includes(query);
      const matchesKind =
        (kindFilter === "preliminary" &&
          question.sourceCollection === "preliminary_questions") ||
        (kindFilter === "written" &&
          question.sourceCollection === "written_questions");
      const matchesSubject =
        subjectFilter === "all" || question.subject === subjectFilter;

      return matchesQuery && matchesKind && matchesSubject;
    });
  }, [bank, kindFilter, searchText, subjectFilter]);

  const totalMarks = selected.reduce(
    (sum, question) => sum + Number(question.marks ?? 0),
    0
  );
  const selectedInTab = selected.filter(
    (question) =>
      question.sourceCollection ===
      (kindFilter === "preliminary"
        ? "preliminary_questions"
        : "written_questions")
  );
  const selectedTabMarks = selectedInTab.reduce(
    (sum, question) => sum + Number(question.marks ?? 0),
    0
  );
  const selectedTabTarget =
    kindFilter === "preliminary"
      ? Number(form.questionsPerAttempt)
      : Number(form.writtenQuestionsPerAttempt);
  const selectedTabRequired =
    selectedTabTarget > 0 ? selectedTabTarget : selectedInTab.length;

  function updateField<Key extends keyof FreeTestForm>(
    field: Key,
    value: FreeTestForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addQuestion(question: ResolvedQuestion) {
    const alreadySelected = selected.some(
      (item) =>
        item.id === question.id &&
        item.sourceCollection === question.sourceCollection
    );

    if (alreadySelected) {
      return;
    }

    setSelected((current) => [...current, question]);
  }

  function removeQuestion(questionId: string, sourceCollection: string) {
    setSelected((current) =>
      current.filter(
        (item) =>
          !(
            item.id === questionId && item.sourceCollection === sourceCollection
          )
      )
    );
  }

  function moveQuestion(index: number, direction: "up" | "down") {
    setSelected((current) => {
      const sourceCollection =
        kindFilter === "preliminary"
          ? "preliminary_questions"
          : "written_questions";
      const phaseQuestions = current.filter(
        (question) => question.sourceCollection === sourceCollection
      );
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= phaseQuestions.length) {
        return current;
      }

      const item = phaseQuestions[index];
      phaseQuestions[index] = phaseQuestions[targetIndex];
      phaseQuestions[targetIndex] = item;
      const preliminaryQuestions =
        sourceCollection === "preliminary_questions"
          ? phaseQuestions
          : current.filter(
              (question) =>
                question.sourceCollection === "preliminary_questions"
            );
      const writtenQuestions =
        sourceCollection === "written_questions"
          ? phaseQuestions
          : current.filter(
              (question) => question.sourceCollection === "written_questions"
            );

      return [...preliminaryQuestions, ...writtenQuestions];
    });
  }

  async function save(targetStatus: "draft" | "published" | "archived") {
    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();

    if (trimmedTitle.length < 3) {
      setError("Title must be at least 3 characters long.");
      return;
    }

    if (trimmedDescription.length < 10) {
      setError("Description must be at least 10 characters long.");
      return;
    }

    const preliminaryDuration = Number(form.preliminaryDurationMinutes);
    const writtenDuration = Number(form.writtenDurationMinutes);
    const passMark = Number(form.passMarkPercent);
    const perAttempt = Number(form.questionsPerAttempt);
    const writtenPerAttempt = Number(form.writtenQuestionsPerAttempt);

    if (
      !Number.isFinite(preliminaryDuration) ||
      !Number.isFinite(writtenDuration) ||
      preliminaryDuration < 0 ||
      writtenDuration < 0 ||
      preliminaryDuration + writtenDuration < 1
    ) {
      setError("Set at least one phase duration to 1 minute or more.");
      return;
    }

    if (!Number.isFinite(passMark) || passMark < 1 || passMark > 100) {
      setError("Pass mark must be between 1 and 100.");
      return;
    }

    if (!Number.isInteger(perAttempt) || perAttempt < 0 || perAttempt > 500) {
      setError("Questions per attempt must be between 0 and 500.");
      return;
    }

    if (
      !Number.isInteger(writtenPerAttempt) ||
      writtenPerAttempt < 0 ||
      writtenPerAttempt > 500
    ) {
      setError("Written questions per attempt must be between 0 and 500.");
      return;
    }

    if (Object.keys(fieldErrors).length > 0) {
      setError("Please fix the highlighted fields before saving.");
      return;
    }

    const selectedPreliminary = selected.filter(
      (question) => question.sourceCollection === "preliminary_questions"
    ).length;
    const selectedWritten = selected.filter(
      (question) => question.sourceCollection === "written_questions"
    ).length;

    if (
      perAttempt > 0 &&
      selectedPreliminary > 0 &&
      perAttempt > selectedPreliminary
    ) {
      setError(
        `Questions per attempt (${perAttempt}) cannot exceed the preliminary pool (${selectedPreliminary}).`
      );
      return;
    }

    if (
      writtenPerAttempt > 0 &&
      selectedWritten > 0 &&
      writtenPerAttempt > selectedWritten
    ) {
      setError(
        `Written questions per attempt (${writtenPerAttempt}) cannot exceed the written pool (${selectedWritten}).`
      );
      return;
    }

    if (
      targetStatus === "published" &&
      ((preliminaryDuration > 0 &&
        (selectedPreliminary === 0 ||
          (perAttempt > 0 && selectedPreliminary < perAttempt))) ||
        (writtenDuration > 0 && selectedWritten === 0) ||
        (selectedPreliminary > 0 && preliminaryDuration <= 0) ||
        (selectedWritten > 0 && writtenDuration <= 0) ||
        selected.length === 0)
    ) {
      setError(
        "Set a duration and select enough questions for each selected phase before publishing."
      );
      return;
    }

    setSaving(true);
    setError(null);
    let redirecting = false;

    try {
      const payload = {
        title: trimmedTitle,
        description: trimmedDescription,
        status:
          targetStatus === "draft" ||
          (isEditing && freeTest?.status === "published")
            ? "draft"
            : undefined,
        preliminaryDurationMinutes: preliminaryDuration,
        writtenDurationMinutes: writtenDuration,
        passMarkPercent: passMark,
        questionsPerAttempt: perAttempt,
        writtenQuestionsPerAttempt: writtenPerAttempt,
        order: Number(form.order),
        scheduledAt: toIsoString(form.scheduledAt),
        closesAt: toIsoString(form.closesAt),
      };

      let freeTestId = freeTest?.id;

      if (isEditing && freeTestId) {
        const patchResponse = await fetch(
          `/api/admin/free-tests/${freeTestId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const patchResult = await patchResponse.json();

        if (!patchResponse.ok) {
          throw new Error(
            patchResult?.error ?? "Unable to update this free test."
          );
        }

        freeTestId = patchResult?.data?.freeTest?._id ?? freeTestId;
      } else {
        const createResponse = await fetch("/api/admin/free-tests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const createResult = await createResponse.json();

        if (!createResponse.ok) {
          throw new Error(
            createResult?.error ?? "Unable to create this free test."
          );
        }

        freeTestId =
          createResult?.data?.exam?._id ?? createResult?.data?.freeTest?._id;
      }

      if (!freeTestId) {
        throw new Error("Unable to resolve the free test id.");
      }

      const questionPayload = {
        questions: selected.map((question) => ({
          sourceCollection: question.sourceCollection,
          questionId: question.id,
        })),
      };

      const questionResponse = await fetch(
        `/api/admin/free-tests/${freeTestId}/questions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(questionPayload),
        }
      );

      const questionResult = await questionResponse.json();

      if (!questionResponse.ok) {
        throw new Error(
          questionResult?.error ?? "Unable to save the selected questions."
        );
      }

      if (
        targetStatus !== "draft" &&
        (!isEditing ||
          freeTest?.status !== targetStatus ||
          payload.status === "draft")
      ) {
        const statusResponse = await fetch(
          `/api/admin/free-tests/${freeTestId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: targetStatus }),
          }
        );

        const statusResult = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(
            statusResult?.error ?? "Unable to update the free test status."
          );
        }
      }

      if (!isEditing) {
        toast("Free test saved.");
        redirecting = true;
        window.location.replace("/admin/free-tests");
        return;
      }

      toast("Saved.");
      router.refresh();
    } catch (saveError) {
      console.error("Save free test error", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Something went wrong while saving this free test."
      );
    } finally {
      if (!redirecting) {
        setSaving(false);
      }
    }
  }

  if (saving) {
    return <AdminFreeTestEditorSkeleton />;
  }

  return (
    <div className="space-y-6">
      <header className="sticky top-16 z-20 border-b border-border bg-background/95 backdrop-blur">
        {Number(form.questionsPerAttempt) === 1 &&
        selectedPreliminaryCount > 1 ? (
          <div className="mx-2 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            Heads up: your test will serve only 1 question per attempt. Set to 0
            to serve all {selectedPreliminaryCount}.
          </div>
        ) : null}
        <div className="flex flex-col gap-4 px-2 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Free Model Tests
            </p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-primary">
              {freeTest?.title || "New free test"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Prelim: {selectedPreliminaryCount} · Written:{" "}
              {selectedWrittenCount}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/free-tests")}
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void save("draft")}
              disabled={saveDisabled}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              Save draft
            </button>
            <button
              type="button"
              onClick={() => void save("published")}
              disabled={saveDisabled || !phasesReady}
              title={!phasesReady ? readinessIssues.join(" ") : undefined}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-cream disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Globe size={16} />
              Save and publish
            </button>
          </div>
        </div>
      </header>

      <ExamLifecycleBar
        status={freeTest?.status ?? "draft"}
        totalQuestions={selected.length}
        requiredQuestions={requiredQuestions}
        hasCourse={false}
      />

      <ExamReadinessCard
        totalQuestions={selected.length}
        requiredQuestions={requiredQuestions}
        hasCourse={false}
        readyToPublish={phasesReady}
        readinessMessage={readinessIssues.join(" ")}
      />

      <div className="space-y-6">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-primary">
              Test settings
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-sm font-medium text-foreground">
                Title
              </span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="w-full rounded-xl border border-border bg-[#f3efe6] px-3 py-3 text-base text-foreground outline-none transition focus:border-primary"
              />
              {fieldErrors.title ? (
                <span className="mt-2 block text-xs text-red-600">
                  {fieldErrors.title}
                </span>
              ) : null}
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-sm font-medium text-foreground">
                Description
              </span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={3}
                className="w-full rounded-xl border border-border bg-[#f3efe6] px-3 py-3 text-base text-foreground outline-none transition focus:border-primary"
              />
              {fieldErrors.description ? (
                <span className="mt-2 block text-xs text-red-600">
                  {fieldErrors.description}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">
                Pass mark (%)
              </span>
              <input
                type="number"
                min={1}
                max={100}
                value={form.passMarkPercent}
                onChange={(event) =>
                  updateField("passMarkPercent", Number(event.target.value))
                }
                className="w-full rounded-xl border border-border bg-[#f3efe6] px-3 py-3 text-base text-foreground outline-none transition focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">
                Display order
              </span>
              <input
                type="number"
                min={0}
                value={form.order}
                onChange={(event) =>
                  updateField("order", Number(event.target.value))
                }
                className="w-full rounded-xl border border-border bg-[#f3efe6] px-3 py-3 text-base text-foreground outline-none transition focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">
                Scheduled at
              </span>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) =>
                  updateField("scheduledAt", event.target.value)
                }
                className="w-full rounded-xl border border-border bg-[#f3efe6] px-3 py-3 text-base text-foreground outline-none transition focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">
                Closes at
              </span>
              <input
                type="datetime-local"
                value={form.closesAt}
                onChange={(event) =>
                  updateField("closesAt", event.target.value)
                }
                className="w-full rounded-xl border border-border bg-[#f3efe6] px-3 py-3 text-base text-foreground outline-none transition focus:border-primary"
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-semibold text-primary">
                Select questions
              </h2>
              <p className="mt-1 text-sm text-muted">
                Pick the questions to include in this free test. The order you
                set here is preserved on student attempts.
              </p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Question type"
            className="mb-5 flex gap-2 border-b border-border"
          >
            {(["preliminary", "written"] as const).map((kind) => {
              const count =
                kind === "preliminary"
                  ? selectedPreliminaryCount
                  : selectedWrittenCount;
              const active = kindFilter === kind;

              return (
                <button
                  key={kind}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setKindFilter(kind);
                    setSubjectFilter("all");
                  }}
                  className={`-mb-px cursor-pointer border-b-2 px-4 py-3 text-sm font-medium ${
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  {kind === "preliminary" ? "Preliminary" : "Written"}
                  <span className="ml-2 rounded-full bg-primary/5 px-2 py-0.5 text-xs">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-5">
            <h3 className="font-heading text-base font-semibold text-primary">
              {kindFilter === "preliminary"
                ? "Preliminary questions"
                : "Written questions"}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {kindFilter === "preliminary"
                ? "MCQ questions served first. Tab-change auto-submit is ON for this phase."
                : "Essay questions served second. Each requires a PDF upload."}
            </p>
          </div>

          <div className="mb-5 grid gap-4 rounded-lg border border-border bg-background p-4 md:grid-cols-2">
            {kindFilter === "preliminary" ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-foreground">
                    Preliminary questions per attempt (0 = serve all)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    step={1}
                    value={form.questionsPerAttempt}
                    onChange={(event) =>
                      updateField(
                        "questionsPerAttempt",
                        Number(event.target.value)
                      )
                    }
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                  {fieldErrors.questionsPerAttempt ? (
                    <span className="mt-2 block text-xs text-red-600">
                      {fieldErrors.questionsPerAttempt}
                    </span>
                  ) : null}
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-foreground">
                    Preliminary duration (minutes)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={600}
                    value={form.preliminaryDurationMinutes}
                    onChange={(event) =>
                      updateField(
                        "preliminaryDurationMinutes",
                        Number(event.target.value)
                      )
                    }
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-foreground">
                    Written questions per attempt (0 = serve all)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    step={1}
                    value={form.writtenQuestionsPerAttempt}
                    onChange={(event) =>
                      updateField(
                        "writtenQuestionsPerAttempt",
                        Number(event.target.value)
                      )
                    }
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                  {fieldErrors.writtenQuestionsPerAttempt ? (
                    <span className="mt-2 block text-xs text-red-600">
                      {fieldErrors.writtenQuestionsPerAttempt}
                    </span>
                  ) : null}
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-foreground">
                    Written duration (minutes)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={600}
                    value={form.writtenDurationMinutes}
                    onChange={(event) =>
                      updateField(
                        "writtenDurationMinutes",
                        Number(event.target.value)
                      )
                    }
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </label>
              </>
            )}
            <div className="flex items-center md:col-span-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1.5 text-xs ${
                  kindFilter === "preliminary"
                    ? preliminaryServing.tone
                    : writtenServing.tone
                }`}
              >
                {kindFilter === "preliminary"
                  ? preliminaryServing.message
                  : writtenServing.message}
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Available
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {filteredBank.length} available
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void fetch("/api/admin/question-bank?limit=500")
                      .then(async (response) => {
                        if (!response.ok) {
                          throw new Error("Unable to refresh the bank.");
                        }

                        const result = await response.json();
                        const nextQuestions = Array.isArray(
                          result?.data?.questions
                        )
                          ? result.data.questions
                          : [];
                        setBank(nextQuestions.map(normalizeBankQuestion));
                      })
                      .catch((loadError) => {
                        console.error("Refresh question bank error", loadError);
                        setBankError("Unable to refresh the bank.");
                      });
                  }}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border bg-card text-primary"
                >
                  <RefreshCw size={15} />
                </button>
              </div>

              <div className="relative mb-3">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search questions"
                  className="h-11 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="mb-3 flex gap-2">
                <select
                  value={subjectFilter}
                  onChange={(event) => setSubjectFilter(event.target.value)}
                  className="h-10 flex-1 rounded-md border border-border bg-white px-2 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="all">All subjects</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {bankLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="h-16 animate-pulse rounded-md border border-border bg-white"
                    />
                  ))}
                </div>
              ) : filteredBank.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-white p-6 text-center text-sm text-muted">
                  <p className="font-medium text-primary">
                    No questions in the bank yet.
                  </p>
                  <p className="mt-2">
                    Add questions from an exam bank to begin.
                  </p>
                </div>
              ) : (
                <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                  {filteredBank.map((question) => {
                    const isSelected = selected.some(
                      (item) =>
                        item.id === question.id &&
                        item.sourceCollection === question.sourceCollection
                    );

                    return (
                      <button
                        type="button"
                        key={`${question.sourceCollection}-${question.id}`}
                        disabled={isSelected}
                        aria-pressed={isSelected}
                        onClick={() => addQuestion(question)}
                        className="flex w-full cursor-pointer items-start gap-3 rounded-lg border border-border bg-white p-3 text-left transition hover:bg-primary/5 disabled:cursor-default disabled:opacity-60"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm text-foreground">
                            {question.questionText}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary">
                              {question.sourceCollection ===
                              "preliminary_questions"
                                ? "Preliminary"
                                : "Written"}
                            </span>
                            <span className="rounded-full border border-border bg-muted/5 px-2 py-1 text-[11px] text-muted">
                              {question.subject}
                            </span>
                            <span className="rounded-full border border-border bg-muted/5 px-2 py-1 text-[11px] text-muted">
                              {question.marks} marks
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                              isSelected
                                ? "bg-accent/10 text-accent"
                                : "border border-border bg-card text-primary"
                            }`}
                          >
                            {isSelected ? (
                              <Check size={16} />
                            ) : (
                              <Plus size={16} />
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {bankError ? (
                <p className="mt-3 text-xs text-red-600">{bankError}</p>
              ) : null}
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Selected {kindFilter}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {selectedInTab.length} selected · {selectedTabMarks} marks
                  </p>
                </div>
                <div className="min-w-24 text-right">
                  <p className="text-xs text-muted">
                    {kindFilter === "preliminary"
                      ? preliminaryServing.message
                      : writtenServing.message}
                  </p>
                  <div
                    role="progressbar"
                    aria-label={`${kindFilter} question target`}
                    aria-valuemin={0}
                    aria-valuemax={selectedTabRequired}
                    aria-valuenow={Math.min(
                      selectedInTab.length,
                      selectedTabRequired
                    )}
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/10"
                  >
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${
                          selectedTabRequired > 0
                            ? Math.min(
                                100,
                                (selectedInTab.length / selectedTabRequired) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {selectedInTab.length === 0 ? (
                <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white p-6 text-center">
                  <HelpCircle className="mb-3 text-muted" size={20} />
                  <p className="text-sm font-medium text-primary">
                    No questions selected
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Pick from the left panel to add questions.
                  </p>
                </div>
              ) : (
                <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                  {selectedInTab.map((question, index) => (
                    <div
                      key={`${question.sourceCollection}-${question.id}`}
                      className="flex items-start gap-3 rounded-lg border border-border bg-white p-3"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-cream">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm text-foreground">
                          {question.questionText}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary">
                            {question.sourceCollection ===
                            "preliminary_questions"
                              ? "Preliminary"
                              : "Written"}
                          </span>
                          <span className="rounded-full border border-border bg-muted/5 px-2 py-1 text-[11px] text-muted">
                            {question.marks} marks
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveQuestion(index, "up")}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-card text-primary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === selectedInTab.length - 1}
                          onClick={() => moveQuestion(index, "down")}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-card text-primary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            removeQuestion(
                              question.id,
                              question.sourceCollection
                            )
                          }
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-card text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-3 z-20 mt-6 flex flex-col gap-4 rounded-lg border border-border bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium text-primary">
                <FileText size={16} />
                Prelim: {selectedPreliminaryCount} · Written:{" "}
                {selectedWrittenCount} · {plural(totalMarks, "mark")} total
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <PhaseProgress
                  label="Preliminary"
                  count={selectedPreliminaryCount}
                  target={Number(form.questionsPerAttempt)}
                />
                <PhaseProgress
                  label="Written"
                  count={selectedWrittenCount}
                  target={Number(form.writtenQuestionsPerAttempt)}
                />
              </div>
            </div>

            <span
              className={`text-xs font-medium ${
                phasesReady ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {phasesReady ? "Ready to publish." : readinessIssues.join(" ")}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

function PhaseProgress({
  label,
  count,
  target,
}: {
  label: string;
  count: number;
  target: number;
}) {
  const effectiveTarget = target > 0 ? target : count;
  const progress =
    effectiveTarget > 0 ? Math.min(100, (count / effectiveTarget) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-muted">
        <span>{label}</span>
        <span>
          {count}/{effectiveTarget}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-primary/10">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
