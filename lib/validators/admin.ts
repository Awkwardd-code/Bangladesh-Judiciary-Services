import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i);
export const studentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  tier: z.enum(["UNIVERSITY", "OTHER"]).optional(),
  status: z.enum(["verified", "unverified", "pending"]).optional(),
});
export const approveStudentSchema = z.object({ userId: objectId });
export const disableStudentSchema = z.object({ userId: objectId });
export const preliminaryExamCreateSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  durationMinutes: z.number().int().min(1).max(600),
  negativeMarking: z.number().min(0).max(2).default(0),
  scheduledAt: z.string().datetime().optional(),
  closesAt: z.string().datetime().optional(),
});
export const preliminaryQuestionCreateSchema = z.object({
  order: z.number().int().min(1),
  questionText: z.string().min(5).max(2000).trim(),
  options: z.array(z.string().min(1).max(500).trim()).length(4),
  correctOptionIndex: z.number().int().min(0).max(3),
  marks: z.number().min(0.5).max(10).default(1),
  subject: z.string().max(80).trim().optional(),
  explanation: z.string().max(2000).trim().optional(),
});
export const writtenExamCreateSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  durationMinutes: z.number().int().min(1).max(600),
  scheduledAt: z.string().datetime().optional(),
  closesAt: z.string().datetime().optional(),
});
export const writtenQuestionCreateSchema = z.object({
  order: z.number().int().min(1),
  questionText: z.string().min(5).max(5000).trim(),
  maxMarks: z.number().min(1).max(100),
  subject: z.string().max(80).trim().optional(),
});
export const gradeSubmissionSchema = z.object({
  perQuestionScores: z
    .array(
      z.object({
        questionId: objectId,
        awardedMarks: z.number().min(0),
        comment: z.string().max(1000).trim().optional(),
      }),
    )
    .min(1),
  feedback: z.string().max(3000).trim().optional(),
});
export type PreliminaryQuestionInput = z.infer<
  typeof preliminaryQuestionCreateSchema
>;
export type WrittenQuestionInput = z.infer<typeof writtenQuestionCreateSchema>;
