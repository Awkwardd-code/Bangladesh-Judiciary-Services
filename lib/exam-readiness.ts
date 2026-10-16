export function isExamLocked(
  totalQuestions: number,
  questionsPerAttempt?: number
) {
  return totalQuestions < Math.max(1, questionsPerAttempt ?? 0);
}
