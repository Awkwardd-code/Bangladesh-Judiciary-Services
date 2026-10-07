import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

export const mcqImportConfirmSchema = z.object({
  examId: objectId,
  replaceExisting: z.boolean().default(false),
  rows: z
    .array(
      z.object({
        order: z.number().int().min(1),
        questionText: z.string().min(5).max(2000),
        options: z.array(z.string().min(1).max(500)).length(4),
        correctOptionIndex: z.number().int().min(0).max(3),
        marks: z.number().min(0.5).max(10),
        subject: z.string().max(80).optional().default(""),
        explanation: z.string().max(2000).optional().default(""),
      }),
    )
    .min(1)
    .max(500),
});

export const writtenImportConfirmSchema = z.object({
  examId: objectId,
  replaceExisting: z.boolean().default(false),
  rows: z
    .array(
      z.object({
        order: z.number().int().min(1),
        questionText: z.string().min(5).max(5000),
        maxMarks: z.number().int().min(1).max(100),
        subject: z.string().max(80).optional().default(""),
      }),
    )
    .min(1)
    .max(500),
});
