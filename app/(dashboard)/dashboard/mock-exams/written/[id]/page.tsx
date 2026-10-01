import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { WrittenExamClient } from "@/components/dashboard/written-exam-client";
import { requireSession } from "@/lib/auth-guard";
import { writtenExamsCol, writtenQuestionsCol, writtenSubmissionsCol } from "@/lib/collections";
import { getActiveExam } from "@/lib/exam-lock";
import { checkExamAccess } from "@/lib/exam-access";

export const metadata: Metadata = {
  title: "Take Written Mock Exam — BJS Prep",
};

export default async function WrittenExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/mock-exams/written/${(await params).id}`)}`);
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const examId = new ObjectId(id);
  const userId = new ObjectId(session.userId);

  const exam = await (await writtenExamsCol()).findOne({ _id: examId });

  if (!exam) {
    notFound();
  }

  const access = await checkExamAccess(userId, examId, "written");

  if (!access.allowed && access.reason === "not-published") {
    notFound();
  }

  if (!access.allowed && access.reason === "another-exam-active") {
    const resumeHref =
      access.activeExamKind === "written"
        ? `/dashboard/mock-exams/written/${access.activeExamId}`
        : `/dashboard/mock-exams/${access.activeExamId}`;

    return (
      <BlockedExamState
        title="An exam is already in progress."
        description="Resume your active exam before starting another one."
        href={resumeHref}
        action="Resume exam"
      />
    );
  }

  if (!access.allowed && access.reason === "not-enrolled") {
    return (
      <BlockedExamState
        title="You are not enrolled in this exam."
        description="Enroll in the linked course to access this exam."
        href="/courses"
        action="Browse courses"
      />
    );
  }

  if (!access.allowed && access.reason === "outside-window") {
    return (
      <BlockedExamState
        title="This exam is not currently open."
        description={
          exam.scheduledAt
            ? `Scheduled to open ${exam.scheduledAt.toLocaleString()}.`
            : "The exam is outside its availability window."
        }
      />
    );
  }

  const questions = await (await writtenQuestionsCol())
    .find({ examId })
    .sort({ order: 1 })
    .toArray();

  const active = await getActiveExam(userId);

  if (active && active.examId.toString() !== examId.toString()) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-6 py-16">
        <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center text-amber-600">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-primary">
            You have an active exam in progress.
          </h1>
          <p className="mt-3 text-sm text-muted">
            Finish your current exam before starting a new one.
          </p>
          <Link
            href={
              active.kind === "preliminary"
                ? `/dashboard/mock-exams/${active.examId}`
                : `/dashboard/mock-exams/written/${active.examId}`
            }
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm text-cream hover:bg-primary-dark"
          >
            Resume exam
          </Link>
        </div>
      </div>
    );
  }

  const submission =
    active && active.kind === "written"
      ? await (await writtenSubmissionsCol()).findOne({
          _id: active.submissionId,
          userId,
          examId,
          activeLock: true,
        })
      : null;

  return (
    <WrittenExamClient
      exam={{
        id: exam._id.toString(),
        title: exam.title,
        description: exam.description ?? "",
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
      }}
      questions={questions.map((question) => ({
        id: question._id.toString(),
        questionText: question.questionText,
        maxMarks: question.maxMarks,
        subject: question.subject ?? "General",
      }))}
      submission={
        submission
          ? {
              id: submission._id.toString(),
              startedAt: submission.startedAt.toISOString(),
              expiresAt: submission.expiresAt.toISOString(),
              shuffledOrder: submission.shuffledOrder,
              perQuestionAnswers: submission.perQuestionAnswers.map((answer) => ({
                questionId: answer.questionId.toString(),
                pdfUrl: answer.pdfUrl,
                pdfPublicId: answer.pdfPublicId,
                uploadedAt: answer.uploadedAt?.toISOString(),
              })),
            }
          : null
      }
    />
  );
}

function BlockedExamState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-6 py-16">
      <div className="w-full rounded-lg border border-border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto text-accent" size={40} />
        <h1 className="mt-4 font-heading text-2xl font-semibold text-primary">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted">{description}</p>
        {href && action ? (
          <Link
            href={href}
            className="mt-6 inline-flex min-h-10 cursor-pointer items-center rounded-md bg-primary px-4 text-sm text-cream"
          >
            {action}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
