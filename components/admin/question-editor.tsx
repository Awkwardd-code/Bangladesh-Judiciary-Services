"use client";

import type { PreliminaryQuestion } from "@/lib/types/exam";

export function QuestionEditor({
  examId,
  question,
  nextOrder,
  onSaved,
}: {
  examId: string;
  question?: PreliminaryQuestion;
  nextOrder: number;
  onSaved: () => void;
}) {
  void examId;
  void question;
  void nextOrder;
  void onSaved;
  return null;
}
