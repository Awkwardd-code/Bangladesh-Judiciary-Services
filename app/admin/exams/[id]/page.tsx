import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";

import {
  ExamDetailClient,
  type AdminExamDetail,
  type AdminExamQuestion,
} from "@/components/admin/exam-detail-client";
import { requireAdmin } from "@/lib/auth-guard";
import { examQuestionsCol, examsCol } from "@/lib/collections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exam details — Admin — LegalPath Bangladesh",
};

export default async function AdminExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  if (!session) {
    return null;
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const examId = new ObjectId(id);
  const [exam, questions] = await Promise.all([
    (await examsCol()).findOne({ _id: examId }),
    (await examQuestionsCol()).find({ examId }).sort({ order: 1 }).toArray(),
  ]);

  if (!exam) {
    notFound();
  }

  function serializeLevel(level: any) {
    return {
      _id: level._id.toString(),
      title: level.title,
      kind: level.kind,
      questionIds: (level.questionIds ?? []).map((questionId: any) =>
        questionId.toString(),
      ),
      durationMinutes: level.durationMinutes,
      passMarkPercent: level.passMarkPercent,
      marks: level.marks,
    };
  }

  function serializeSubSegment(subSegment: any) {
    return {
      _id: subSegment._id.toString(),
      title: subSegment.title,
      description: subSegment.description ?? "",
      order: subSegment.order ?? 0,
      levels: (subSegment.levels ?? []).map(serializeLevel),
    };
  }

  function serializeSegment(segment: any) {
    return {
      _id: segment._id.toString(),
      title: segment.title,
      description: segment.description ?? "",
      order: segment.order ?? 0,
      isFree: Boolean(segment.isFree),
      price: segment.price ?? 0,
      discountedPrice: segment.discountedPrice ?? undefined,
      subSegments: (segment.subSegments ?? []).map(serializeSubSegment),
    };
  }

  const serializedExam: AdminExamDetail = {
    _id: exam._id.toString(),
    courseId: exam.courseId.toString(),
    segmentId: exam.segmentId.toString(),
    subSegmentId: exam.subSegmentId.toString(),
    kind: exam.kind,
    title: exam.title,
    description: exam.description ?? "",
    status: exam.status,
    type: exam.type ?? "paid",
    price: exam.price ?? 0,
    discountedPrice: exam.discountedPrice ?? undefined,
    validityMonths: exam.validityMonths ?? 12,
    discountTill: exam.discountTill?.toISOString() ?? undefined,
    purchaseMode: exam.purchaseMode ?? "complete",
    totalQuestions: exam.totalQuestions,
    totalMarks: exam.totalMarks,
    questionsPerAttempt: exam.questionsPerAttempt,
    durationMinutes: exam.durationMinutes,
    passMarkPercent: exam.passMarkPercent ?? 50,
    negativeMarking: exam.negativeMarking ?? 0,
    scheduledAt: exam.scheduledAt?.toISOString() ?? undefined,
    closesAt: exam.closesAt?.toISOString() ?? undefined,
    order: exam.order ?? 0,
    segments: (exam.segments ?? []).map(serializeSegment),
  };
  const serializedQuestions: AdminExamQuestion[] = questions.map((question) => ({
    _id: question._id.toString(),
    order: question.order,
    questionText: question.questionText,
    options: question.options,
    correctOptionIndex: question.correctOptionIndex,
    marks: question.marks,
    maxMarks: question.maxMarks,
    subject: question.subject,
    explanation: question.explanation,
  }));

  return (
    <ExamDetailClient
      examId={exam._id.toString()}
      initialExam={serializedExam}
      initialQuestions={serializedQuestions}
    />
  );
}
