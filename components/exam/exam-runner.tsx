"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  FileQuestion,
  Info,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

import { ExamPaperFooter } from "@/components/exam/exam-paper-footer";
import { ExamPaperHeader } from "@/components/exam/exam-paper-header";
import { ExamPaperSkeleton } from "@/components/exam/exam-paper-skeleton";
import { ExamSubmittingScreen } from "@/components/exam/exam-submitting-screen";
import { ExamThankYou } from "@/components/exam/exam-thank-you";
import { QuestionCard } from "@/components/exam/question-card";
import type {
  RunnerQuestion,
  UploadedPdf,
} from "@/components/exam/question-card";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";

type ExamKind = "preliminary" | "written" | "free";
type SubmitReason =
  "manual" | "tab-change" | "visibility-hidden" | "time-expired";

type SubmittedAttempt = {
  attemptId: string;
  score: number | null;
  autoSubmitReason: SubmitReason;
};

type RunnerQuestionData = RunnerQuestion & {
  position: number;
  source?: "preliminary_questions" | "written_questions";
  maxMarks?: number;
};

type RunnerAnswer = {
  questionId: string;
  selectedOptionIndex: number | null;
  answeredAt: string | null;
  pdfUrl?: string | null;
  pdfPublicId?: string | null;
  uploadedAt?: string | null;
};

type RunnerAttempt = {
  id: string;
  startedAt: string;
  expiresAt: string;
  shuffledOrder: number[];
  currentPhase?: "preliminary" | "written";
  phaseStartedAt?: string;
  preliminaryDurationMinutes?: number | null;
  writtenDurationMinutes?: number | null;
  preliminaryEndsAt?: string | null;
  writtenEndsAt?: string | null;
  answers: RunnerAnswer[];
  perQuestionAnswers?: Array<{
    questionId: string;
    pdfUrl: string | null;
    pdfPublicId: string | null;
    uploadedAt: string | null;
  }>;
};

type ExamRunnerProps = {
  exam: {
    id: string;
    kind: ExamKind;
    title: string;
    durationMinutes: number;
    totalQuestions: number;
    totalMarks: number;
    questionsPerAttempt: number;
    passMarkPercent?: number;
    negativeMarking?: number;
    hasWrittenQuestions?: boolean;
    preliminaryQuestionCount?: number;
    writtenQuestionCount?: number;
    preliminaryDurationMinutes?: number;
    writtenDurationMinutes?: number;
    writtenQuestionsPerAttempt?: number;
  };
  attempt: RunnerAttempt | null;
  questions: RunnerQuestionData[] | null;
};

type AttemptRecord = {
  id?: string;
  _id?: string;
  startedAt: string | Date;
  expiresAt: string | Date;
  shuffledOrder?: number[];
  answers?: RunnerAnswer[];
  perQuestionAnswers?: RunnerAttempt["perQuestionAnswers"];
  selectedQuestionIds?: string[];
  currentPhase?: "preliminary" | "written";
  phaseStartedAt?: string | Date;
  preliminaryDurationMinutes?: number | null;
  writtenDurationMinutes?: number | null;
  preliminaryEndsAt?: string | Date | null;
  writtenEndsAt?: string | Date | null;
};

const uploadLimit = 10 * 1024 * 1024;

function getEffectiveTarget(poolSize: number, configuredTarget: number) {
  if (poolSize === 0) {
    return 0;
  }

  return configuredTarget > 0 ? Math.min(configuredTarget, poolSize) : poolSize;
}

function orderQuestions(
  source: RunnerQuestionData[],
  questionIds: string[]
): RunnerQuestionData[] {
  if (questionIds.length === 0) {
    return source;
  }

  const questionMap = new Map(
    source.map((question) => [question.id, question])
  );
  const ordered = questionIds
    .map((id) => questionMap.get(id))
    .filter(
      (question): question is RunnerQuestionData => question !== undefined
    );

  return ordered.length > 0 ? ordered : source;
}

function getQuestionIds(attempt: AttemptRecord): string[] {
  const answerIds = (attempt.answers ?? [])
    .map((answer) => answer.questionId)
    .filter(Boolean);

  if (answerIds.length > 0) {
    return answerIds;
  }

  const uploadedAnswerIds = (attempt.perQuestionAnswers ?? [])
    .map((answer) => answer.questionId)
    .filter(Boolean);

  if (uploadedAnswerIds.length > 0) {
    return uploadedAnswerIds;
  }

  return (attempt.selectedQuestionIds ?? []).map(String);
}

function normalizeDate(value: string | Date | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isWrittenQuestion(question: RunnerQuestionData): boolean {
  return (
    question.source === "written_questions" ||
    ((!question.options || question.options.length === 0) &&
      question.maxMarks !== undefined)
  );
}

function toUploadedPdf(answer: {
  questionId: string;
  pdfUrl?: string | null;
  pdfPublicId?: string | null;
  uploadedAt?: string | null;
}): UploadedPdf | null {
  if (!answer.pdfUrl) {
    return null;
  }

  const publicIdName = answer.pdfPublicId?.split("/").pop();

  return {
    url: answer.pdfUrl,
    name: publicIdName ? `${publicIdName}.pdf` : "Uploaded answer.pdf",
    uploadedAt: answer.uploadedAt ?? new Date().toISOString(),
  };
}

export function ExamRunner({ exam, attempt, questions }: ExamRunnerProps) {
  const [examDetails, setExamDetails] = useState(exam);
  const initialQuestionList = questions ?? [];
  const initialQuestionIds = attempt ? getQuestionIds(attempt) : [];
  const initialAnswers: Record<string, number | null> = {};
  const initialLocked = new Set<string>();

  for (const answer of attempt?.answers ?? []) {
    initialAnswers[answer.questionId] = answer.selectedOptionIndex;

    if (answer.selectedOptionIndex !== null) {
      initialLocked.add(answer.questionId);
    }
  }

  const initialUploadedPdfs: Record<string, UploadedPdf> = {};
  const initialPdfAnswers =
    attempt?.perQuestionAnswers ??
    (attempt?.answers ?? []).map((answer) => ({
      questionId: answer.questionId,
      pdfUrl: answer.pdfUrl ?? null,
      pdfPublicId: answer.pdfPublicId ?? null,
      uploadedAt: answer.uploadedAt ?? null,
    }));

  for (const answer of initialPdfAnswers) {
    const uploadedPdf = toUploadedPdf(answer);

    if (uploadedPdf) {
      initialUploadedPdfs[answer.questionId] = uploadedPdf;
      initialLocked.add(answer.questionId);
    }
  }

  const [attemptId, setAttemptId] = useState<string | null>(
    attempt?.id ?? null
  );
  const [expiresAt, setExpiresAt] = useState<string | null>(
    attempt?.expiresAt ?? null
  );
  const [currentPhase, setCurrentPhase] = useState<
    "preliminary" | "written" | null
  >(attempt?.currentPhase ?? null);
  const [questionList, setQuestionList] = useState<RunnerQuestionData[]>(() =>
    orderQuestions(initialQuestionList, initialQuestionIds)
  );
  const [shuffledOrder, setShuffledOrder] = useState<number[]>(
    attempt?.shuffledOrder ?? []
  );
  const [answers, setAnswers] =
    useState<Record<string, number | null>>(initialAnswers);
  const [locked, setLocked] = useState<Set<string>>(initialLocked);
  const [uploadedPdfs, setUploadedPdfs] =
    useState<Record<string, UploadedPdf>>(initialUploadedPdfs);
  const [uploadingPdf, setUploadingPdf] = useState<Set<string>>(new Set());
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(() => {
    if (!attempt?.expiresAt) {
      return examDetails.durationMinutes * 60;
    }

    return Math.max(
      0,
      Math.ceil((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000)
    );
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittingOverlay, setSubmittingOverlay] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAttempt, setSubmittedAttempt] =
    useState<SubmittedAttempt | null>(null);
  const [autoSubmitReason, setAutoSubmitReason] = useState<SubmitReason | null>(
    null
  );
  const [starting, setStarting] = useState(false);
  const [phaseTransitioning, setPhaseTransitioning] = useState(false);
  const [phaseOverlayVisible, setPhaseOverlayVisible] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(!attempt);
  const [readRules, setReadRules] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationCount, setConfirmationCount] = useState(0);
  const submitLockRef = useRef(false);
  const submitHandlerRef = useRef<
    (
      reason: "manual" | "tab-change" | "visibility-hidden" | "time-expired"
    ) => void
  >(() => {});
  const transitionHandlerRef = useRef<(fromTimer?: boolean) => void>(() => {});
  const lastAutoSubmitRef = useRef(0);
  const transitionAttemptedRef = useRef(false);
  const phaseOverlayTimerRef = useRef<number | null>(null);

  const hasWritten =
    Boolean(examDetails.hasWrittenQuestions) ||
    questionList.some(isWrittenQuestion);
  const hasPhases =
    exam.kind === "free" &&
    currentPhase !== null &&
    questionList.some(
      (question) => question.source === "preliminary_questions"
    ) &&
    questionList.some((question) => question.source === "written_questions");
  const isWrittenPhase =
    exam.kind === "written" ||
    (exam.kind === "free" && currentPhase === "written");
  const canSwitchTabs =
    exam.kind === "written" || (hasWritten && (!hasPhases || isWrittenPhase));
  const canTransitionToWritten =
    hasPhases && currentPhase === "preliminary" && Boolean(attemptId);
  const hasActiveAttempt = Boolean(attemptId && expiresAt);
  const effectiveQuestionCount =
    exam.kind === "free" &&
    (examDetails.preliminaryQuestionCount !== undefined ||
      examDetails.writtenQuestionCount !== undefined)
      ? getEffectiveTarget(
          examDetails.preliminaryQuestionCount ?? 0,
          examDetails.questionsPerAttempt
        ) +
        getEffectiveTarget(
          examDetails.writtenQuestionCount ?? 0,
          examDetails.writtenQuestionsPerAttempt ?? 0
        )
      : examDetails.questionsPerAttempt > 0
        ? Math.min(examDetails.questionsPerAttempt, examDetails.totalQuestions)
        : examDetails.totalQuestions;
  const displayedQuestions = useMemo(() => {
    const ordered =
      shuffledOrder.length === 0
        ? questionList
        : shuffledOrder
            .map((index) => questionList[index])
            .filter(
              (question): question is RunnerQuestionData =>
                question !== undefined
            );

    if (!hasPhases || !currentPhase) {
      return ordered;
    }

    return ordered.filter((question) =>
      currentPhase === "preliminary"
        ? question.source === "preliminary_questions"
        : question.source === "written_questions"
    );
  }, [currentPhase, hasPhases, questionList, shuffledOrder]);
  const answeredCount = useMemo(
    () =>
      displayedQuestions.filter((question) =>
        isWrittenQuestion(question)
          ? Boolean(uploadedPdfs[question.id])
          : answers[question.id] !== null && answers[question.id] !== undefined
      ).length,
    [answers, displayedQuestions, uploadedPdfs]
  );
  const missingWrittenCount = displayedQuestions.filter(
    (question) => isWrittenQuestion(question) && !uploadedPdfs[question.id]
  ).length;
  const missingMcqCount = displayedQuestions.filter(
    (question) =>
      !isWrittenQuestion(question) &&
      (answers[question.id] === null || answers[question.id] === undefined)
  ).length;
  const unansweredCount = Math.max(
    0,
    displayedQuestions.length - answeredCount
  );

  async function submitExam(
    reason: "manual" | "tab-change" | "visibility-hidden" | "time-expired"
  ) {
    if (!attemptId || submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setSubmittingOverlay(true);
    setAutoSubmitReason(reason);

    try {
      const endpoint =
        exam.kind === "free"
          ? `/api/free-tests/${exam.id}/submit`
          : `/api/exams/${exam.kind}/${exam.id}/submit`;
      const body =
        exam.kind === "written"
          ? { submissionId: attemptId, reason }
          : { attemptId, reason };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok || payload.success === false) {
        throw new Error(payload?.error ?? "Unable to submit this exam.");
      }

      const attemptResult =
        payload?.data?.attempt ?? payload?.data?.submission ?? null;
      const rawScore =
        typeof attemptResult?.score === "number"
          ? attemptResult.score
          : typeof attemptResult?.totalScore === "number"
            ? attemptResult.totalScore
            : null;
      const score =
        rawScore !== null && examDetails.totalMarks > 0
          ? Math.round((rawScore / examDetails.totalMarks) * 100)
          : null;

      setSubmittedAttempt({
        attemptId,
        score,
        autoSubmitReason: reason,
      });
      setSubmitted(true);
      setConfirmationOpen(false);
      setSubmittingOverlay(false);
      window.history.replaceState(
        { ...window.history.state, submitted: true },
        "",
        window.location.href
      );

      if (phaseOverlayTimerRef.current !== null) {
        window.clearTimeout(phaseOverlayTimerRef.current);
        phaseOverlayTimerRef.current = null;
      }
    } catch (error) {
      console.error("Exam submission error", error);
      submitLockRef.current = false;
      setSubmitting(false);
      setSubmittingOverlay(false);
      setAutoSubmitReason(null);
      toast(
        error instanceof Error ? error.message : "Unable to submit this exam.",
        "error"
      );
    }
  }

  submitHandlerRef.current = submitExam;

  async function transitionToWrittenPhase(fromTimer = false) {
    if (
      !attemptId ||
      !canTransitionToWritten ||
      phaseTransitioning ||
      (fromTimer && transitionAttemptedRef.current)
    ) {
      return;
    }

    if (!fromTimer) {
      transitionAttemptedRef.current = false;
    }

    transitionAttemptedRef.current = true;
    setPhaseTransitioning(true);
    setPhaseOverlayVisible(true);

    try {
      const response = await fetch(`/api/free-tests/${exam.id}/phase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to start the written phase.");
      }

      const nextPhaseStartedAt = normalizeDate(payload?.data?.phaseStartedAt);
      const nextExpiresAt = normalizeDate(payload?.data?.expiresAt);

      if (!nextPhaseStartedAt || !nextExpiresAt) {
        throw new Error("The written phase timing data is incomplete.");
      }

      setCurrentPhase("written");
      setExpiresAt(nextExpiresAt);
      setPhaseOverlayVisible(true);
      if (phaseOverlayTimerRef.current !== null) {
        window.clearTimeout(phaseOverlayTimerRef.current);
      }
      phaseOverlayTimerRef.current = window.setTimeout(() => {
        setPhaseOverlayVisible(false);
        phaseOverlayTimerRef.current = null;
      }, 2000);
      setTimeLeftSeconds(
        Math.max(
          0,
          Math.ceil((new Date(nextExpiresAt).getTime() - Date.now()) / 1000)
        )
      );
      toast(
        "Preliminary phase complete. The written phase has started.",
        "success"
      );
    } catch (error) {
      console.error("Free test phase transition error", error);
      setPhaseOverlayVisible(false);
      toast(
        error instanceof Error
          ? error.message
          : "Unable to start the written phase.",
        "error"
      );
      if (fromTimer) {
        submitHandlerRef.current("time-expired");
      }
    } finally {
      setPhaseTransitioning(false);
    }
  }

  transitionHandlerRef.current = transitionToWrittenPhase;

  useEffect(
    () => () => {
      if (phaseOverlayTimerRef.current !== null) {
        window.clearTimeout(phaseOverlayTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!hasActiveAttempt || !expiresAt || submitted || submittingOverlay) {
      return undefined;
    }

    const tick = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );

      setTimeLeftSeconds(remaining);

      if (remaining <= 0) {
        if (canTransitionToWritten) {
          void transitionHandlerRef.current(true);
        } else {
          submitHandlerRef.current("time-expired");
        }
      }
    }, 1000);

    return () => window.clearInterval(tick);
  }, [
    canTransitionToWritten,
    expiresAt,
    hasActiveAttempt,
    submitted,
    submittingOverlay,
  ]);

  useEffect(() => {
    if (!hasActiveAttempt || submitted || submittingOverlay || canSwitchTabs) {
      return undefined;
    }

    let debounceTimer: number | undefined;

    function scheduleAutoSubmit(reason: "tab-change" | "visibility-hidden") {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        const shouldSubmit =
          reason === "visibility-hidden"
            ? document.visibilityState === "hidden"
            : !document.hasFocus();
        const now = Date.now();

        if (shouldSubmit && now - lastAutoSubmitRef.current >= 800) {
          lastAutoSubmitRef.current = now;
          submitHandlerRef.current(reason);
        }
      }, 800);
    }

    function handleBlur() {
      scheduleAutoSubmit("tab-change");
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        scheduleAutoSubmit("visibility-hidden");
      } else {
        window.clearTimeout(debounceTimer);
      }
    }

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(debounceTimer);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [canSwitchTabs, hasActiveAttempt, submitted, submittingOverlay]);

  async function handleStart() {
    if (starting) {
      return;
    }

    setStarting(true);

    try {
      const endpoint =
        exam.kind === "free"
          ? `/api/free-tests/${exam.id}/start`
          : `/api/exams/${exam.kind}/${exam.id}/start`;
      const response = await fetch(endpoint, { method: "POST" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to start this exam.");
      }

      const data = payload.data ?? {};
      const freshExam = data.freeTest ?? data.exam;

      if (freshExam && typeof freshExam.title === "string") {
        setExamDetails((current) => ({
          ...current,
          ...freshExam,
          id: exam.id,
          kind: exam.kind,
        }));
      }

      const nextAttempt: AttemptRecord | undefined =
        exam.kind === "written" ? data.submission : data.attempt;

      if (!nextAttempt) {
        throw new Error("No exam attempt was returned.");
      }

      const nextAttemptId = String(nextAttempt.id ?? nextAttempt._id ?? "");
      const nextExpiresAt = normalizeDate(nextAttempt.expiresAt);

      if (!nextAttemptId || !nextExpiresAt) {
        throw new Error("The exam attempt data is incomplete.");
      }

      const serverQuestions = Array.isArray(data.questions)
        ? (data.questions as RunnerQuestionData[])
        : questionList;
      const nextQuestionIds = getQuestionIds(nextAttempt);
      const nextQuestions = orderQuestions(serverQuestions, nextQuestionIds);
      const nextAnswers: Record<string, number | null> = {};
      const nextLocked = new Set<string>();
      const nextUploadedPdfs: Record<string, UploadedPdf> = {};
      const nextAnswerEntries = nextAttempt.answers ?? [];

      for (const answer of nextAnswerEntries) {
        nextAnswers[answer.questionId] = answer.selectedOptionIndex;

        if (answer.selectedOptionIndex !== null) {
          nextLocked.add(answer.questionId);
        }
      }

      const nextPdfAnswers =
        nextAttempt.perQuestionAnswers ??
        nextAnswerEntries.map((answer) => ({
          questionId: answer.questionId,
          pdfUrl: answer.pdfUrl ?? null,
          pdfPublicId: answer.pdfPublicId ?? null,
          uploadedAt: answer.uploadedAt ?? null,
        }));

      for (const answer of nextPdfAnswers) {
        const uploadedPdf = toUploadedPdf(answer);

        if (uploadedPdf) {
          nextUploadedPdfs[answer.questionId] = uploadedPdf;
          nextLocked.add(answer.questionId);
        }
      }

      setAttemptId(nextAttemptId);
      setExpiresAt(nextExpiresAt);
      setCurrentPhase(nextAttempt.currentPhase ?? null);
      transitionAttemptedRef.current = false;
      setQuestionList(nextQuestions);
      setShuffledOrder(
        Array.isArray(nextAttempt.shuffledOrder)
          ? nextAttempt.shuffledOrder
          : nextQuestions.map((_, index) => index)
      );
      setAnswers(nextAnswers);
      setLocked(nextLocked);
      setUploadedPdfs(nextUploadedPdfs);
      setTimeLeftSeconds(
        Math.max(
          0,
          Math.ceil((new Date(nextExpiresAt).getTime() - Date.now()) / 1000)
        )
      );
      setStartDialogOpen(false);
      setReadRules(false);
    } catch (error) {
      console.error("Exam start error", error);
      toast(
        error instanceof Error ? error.message : "Unable to start this exam.",
        "error"
      );
    } finally {
      setStarting(false);
    }
  }

  async function handleOptionClick(questionId: string, optionIndex: number) {
    if (!attemptId || locked.has(questionId)) {
      return;
    }

    const previousValue = answers[questionId] ?? null;
    const nextAnswers = { ...answers, [questionId]: optionIndex };
    const nextLocked = new Set(locked);

    nextLocked.add(questionId);
    setAnswers(nextAnswers);
    setLocked(nextLocked);

    try {
      const endpoint =
        exam.kind === "free"
          ? `/api/free-tests/${exam.id}/answer`
          : `/api/exams/preliminary/${exam.id}/answer`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attemptId,
          questionId,
          selectedOptionIndex: optionIndex,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Answer could not be saved.");
      }
    } catch (error) {
      console.error("Exam answer error", error);
      setAnswers((current) => ({
        ...current,
        [questionId]: previousValue,
      }));
      setLocked((current) => {
        const next = new Set(current);
        next.delete(questionId);
        return next;
      });
      toast(
        error instanceof Error ? error.message : "Answer could not be saved.",
        "error"
      );
    }
  }

  async function handlePdfUpload(questionId: string, file: File) {
    if (
      !attemptId ||
      uploadedPdfs[questionId] ||
      uploadingPdf.has(questionId)
    ) {
      return;
    }

    if (file.type !== "application/pdf") {
      toast("Only PDF files are allowed.", "error");
      return;
    }

    if (file.size > uploadLimit) {
      toast("PDF files must be 10 MB or smaller.", "error");
      return;
    }

    setUploadingPdf((current) => new Set(current).add(questionId));

    try {
      const formData = new FormData();

      formData.append(
        exam.kind === "written" ? "submissionId" : "attemptId",
        attemptId
      );
      formData.append("questionId", questionId);
      formData.append("file", file);

      const endpoint =
        exam.kind === "written"
          ? `/api/exams/written/${exam.id}/answer`
          : `/api/free-tests/${exam.id}/answer`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to upload this answer.");
      }

      const pdfUrl = payload.data?.pdfUrl;

      if (typeof pdfUrl !== "string" || pdfUrl.length === 0) {
        throw new Error("The upload completed without returning a PDF link.");
      }

      const uploadedAt = new Date().toISOString();

      setUploadedPdfs((current) => ({
        ...current,
        [questionId]: {
          url: pdfUrl,
          name: file.name,
          uploadedAt,
        },
      }));
      setLocked((current) => new Set(current).add(questionId));
      toast("Answer PDF uploaded and locked.", "success");
    } catch (error) {
      console.error("Written answer upload error", error);
      toast(
        error instanceof Error
          ? error.message
          : "Unable to upload this answer.",
        "error"
      );
    } finally {
      setUploadingPdf((current) => {
        const next = new Set(current);
        next.delete(questionId);
        return next;
      });
    }
  }

  function requestManualSubmit() {
    if (submitting || submitted) {
      return;
    }

    if (unansweredCount > 0) {
      setConfirmationCount(unansweredCount);
      setConfirmationOpen(true);
      return;
    }

    void submitExam("manual");
  }

  if (submittingOverlay) {
    return <ExamSubmittingScreen reason={autoSubmitReason} />;
  }

  if (phaseOverlayVisible) {
    return <ExamPaperSkeleton withTimer withFooter />;
  }

  if (submitted && submittedAttempt) {
    const resultHref =
      exam.kind === "preliminary"
        ? `/dashboard/mock-exams/${exam.id}/result?attemptId=${encodeURIComponent(submittedAttempt.attemptId)}`
        : exam.kind === "written"
          ? `/dashboard/mock-exams/written/${exam.id}/result?attemptId=${encodeURIComponent(submittedAttempt.attemptId)}`
          : `/dashboard/free-tests/${exam.id}/result?attemptId=${encodeURIComponent(submittedAttempt.attemptId)}`;

    return (
      <ExamThankYou
        kind={exam.kind}
        examTitle={examDetails.title}
        resultHref={resultHref}
        autoSubmitReason={submittedAttempt.autoSubmitReason}
        score={submittedAttempt.score}
        passMarkPercent={examDetails.passMarkPercent}
      />
    );
  }

  if (startDialogOpen) {
    const examRules = [
      "All questions are shown on one page.",
      hasWritten
        ? "Written answers must be uploaded as a PDF (max 10 MB)."
        : "Each question locks once you select an answer.",
      ...(hasPhases
        ? [
            `Preliminary phase: ${examDetails.preliminaryDurationMinutes} minutes.`,
            `Written phase: ${examDetails.writtenDurationMinutes} minutes. Starting it ends the preliminary phase.`,
          ]
        : []),
      canSwitchTabs
        ? "You may switch tabs to reference materials; the timer continues."
        : "Switching tabs or minimising the window will submit your exam immediately.",
      "When the timer expires, your exam is submitted automatically.",
      ...(examDetails.passMarkPercent !== null &&
      examDetails.passMarkPercent !== undefined
        ? [`Pass mark: ${examDetails.passMarkPercent}%.`]
        : []),
    ];

    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
        <Card className="w-full max-w-3xl overflow-hidden rounded-2xl border-border bg-card shadow-[0_16px_50px_rgba(18,33,63,0.08)]">
          <div className="h-1.5 bg-accent" />
          <div className="p-6 sm:p-9 lg:p-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <BookOpen aria-hidden="true" size={23} />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Before you begin
                </p>
                <h1 className="mt-1 font-heading text-2xl font-semibold text-primary sm:text-3xl">
                  {examDetails.title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Take a moment to review the exam details and rules.
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/70 p-4">
                <Clock3
                  aria-hidden="true"
                  className="shrink-0 text-accent"
                  size={20}
                />
                <div>
                  <p className="text-xs text-muted">Duration</p>
                  <p className="mt-0.5 font-semibold text-primary">
                    {examDetails.durationMinutes} min
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/70 p-4">
                <FileQuestion
                  aria-hidden="true"
                  className="shrink-0 text-accent"
                  size={20}
                />
                <div>
                  <p className="text-xs text-muted">Questions</p>
                  <p className="mt-0.5 font-semibold text-primary">
                    {effectiveQuestionCount}
                  </p>
                </div>
              </div>
            </div>

            <section
              aria-labelledby="exam-rules-heading"
              className="mt-7 rounded-xl border border-border bg-background/60 p-5 sm:p-6"
            >
              <h2
                id="exam-rules-heading"
                className="flex items-center gap-2 text-sm font-semibold text-primary"
              >
                <ShieldCheck
                  aria-hidden="true"
                  className="text-accent"
                  size={18}
                />
                Exam rules
              </h2>
              <ul className="mt-4 space-y-3">
                {examRules.map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-3 text-sm leading-6 text-foreground"
                  >
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
                      <Check aria-hidden="true" size={13} />
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </section>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 text-sm leading-6 text-foreground transition-colors hover:bg-background/70">
              <input
                type="checkbox"
                checked={readRules}
                onChange={(event) => setReadRules(event.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />
              <span>I have read and understood the exam rules.</span>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">
                Your timer starts when you select Begin exam.
              </p>
              <button
                type="button"
                onClick={() => void handleStart()}
                disabled={!readRules || starting}
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-cream hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {starting ? (
                  <>
                    <Loader2
                      aria-hidden="true"
                      className="animate-spin"
                      size={17}
                    />
                    Preparing exam…
                  </>
                ) : (
                  <>
                    Begin exam
                    <ArrowRight aria-hidden="true" size={17} />
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-4">
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Card className="overflow-visible border-border bg-card shadow-sm">
          <ExamPaperHeader
            examTitle={examDetails.title}
            durationMinutes={
              currentPhase === "preliminary"
                ? (examDetails.preliminaryDurationMinutes ??
                  examDetails.durationMinutes)
                : currentPhase === "written"
                  ? (examDetails.writtenDurationMinutes ??
                    examDetails.durationMinutes)
                  : examDetails.durationMinutes
            }
            totalMarks={examDetails.totalMarks}
            sessionYear={
              examDetails.title.match(/\b20\d{2}\b/)?.[0] ?? "Current Session"
            }
            kind={exam.kind}
            timeLeftSeconds={timeLeftSeconds}
            phase={hasPhases ? currentPhase : null}
          />
          <div
            className={`mx-6 mt-6 flex items-start gap-3 rounded-md p-4 text-sm lg:mx-8 ${
              hasWritten
                ? "border border-blue-200 bg-blue-50 text-blue-900"
                : "border border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            {hasWritten ? (
              <Info className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <p>
              {canSwitchTabs
                ? "You may switch tabs to reference materials. The timer continues in the background."
                : "Do not switch tabs or minimise the window. Doing so submits your exam immediately."}
            </p>
          </div>

          <div className="space-y-8 px-6 py-8 lg:px-8">
            {displayedQuestions.map((question, index) => {
              const isMCQ =
                Array.isArray(question.options) && question.options.length > 0;
              const selectedOptionIndex = answers[question.id] ?? null;

              return (
                <QuestionCard
                  key={question.id}
                  index={index}
                  question={question}
                  isMCQ={isMCQ}
                  isLocked={locked.has(question.id)}
                  selectedOptionIndex={selectedOptionIndex}
                  uploadedPdf={uploadedPdfs[question.id] ?? null}
                  isUploading={uploadingPdf.has(question.id)}
                  onOptionClick={handleOptionClick}
                  onPdfUpload={handlePdfUpload}
                />
              );
            })}
          </div>
          <ExamPaperFooter
            submitting={submitting}
            onSubmit={requestManualSubmit}
            kind={exam.kind}
            onPhaseSubmit={
              canTransitionToWritten
                ? () => void transitionToWrittenPhase()
                : undefined
            }
            phaseSubmitting={phaseTransitioning}
            phaseSubmitLabel="Submit preliminary phase"
          />
        </Card>
      </main>

      {confirmationOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/75 p-4">
          <Card
            aria-labelledby="submit-confirmation-title"
            className="w-full max-w-md border-border bg-card p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="submit-confirmation-title"
                className="font-heading text-xl font-semibold text-primary"
              >
                Submit your exam?
              </h2>
              <button
                type="button"
                aria-label="Close confirmation"
                onClick={() => setConfirmationOpen(false)}
                className="cursor-pointer rounded p-1 text-muted hover:bg-muted/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-sm text-muted">
              {hasWritten && missingMcqCount > 0
                ? `You have not uploaded answers for ${missingWrittenCount} written question${
                    missingWrittenCount === 1 ? "" : "s"
                  } and have ${missingMcqCount} unanswered multiple-choice question${
                    missingMcqCount === 1 ? "" : "s"
                  }. Submit anyway?`
                : hasWritten
                  ? `You have not uploaded answers for ${confirmationCount} question${
                      confirmationCount === 1 ? "" : "s"
                    }. Submit anyway?`
                  : `You have ${confirmationCount} unanswered question${
                      confirmationCount === 1 ? "" : "s"
                    }. Submit anyway?`}
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmationOpen(false)}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border px-4 text-sm text-foreground hover:bg-muted/5"
              >
                Upload more
              </button>
              <button
                type="button"
                onClick={() => void submitExam("manual")}
                disabled={submitting}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm text-cream hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                Submit anyway
              </button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
