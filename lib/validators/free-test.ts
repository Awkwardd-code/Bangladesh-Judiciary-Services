import { z } from "zod";

const freeTestFields = {
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(10).max(2000).trim(),
  preliminaryDurationMinutes: z.number().int().min(0).max(600).default(0),
  writtenDurationMinutes: z.number().int().min(0).max(600).default(0),
  // NOTE: 0 means serve every written question in the pool.
  writtenQuestionsPerAttempt: z.number().int().min(0).max(500).default(0),
  durationMinutes: z.number().int().min(0).max(600).optional(),
  passMarkPercent: z.number().int().min(1).max(100).default(50),
  // NOTE: 0 means serve every preliminary question in the pool.
  questionsPerAttempt: z.number().int().min(0).max(500).default(0),
  order: z.number().int().min(0).max(9999).default(0),
  scheduledAt: z.string().datetime().optional(),
  closesAt: z.string().datetime().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
};

export const freeTestCreateSchema = z
  .object(freeTestFields)
  .refine(
    (value) =>
      value.questionsPerAttempt === 0 || value.questionsPerAttempt <= 1000,
    {
      message: "Questions per attempt must be 0 or a positive number.",
      path: ["questionsPerAttempt"],
    }
  )
  .superRefine((value, context) => {
    if (
      value.preliminaryDurationMinutes === 0 &&
      value.writtenDurationMinutes === 0 &&
      (value.durationMinutes ?? 0) === 0
    ) {
      context.addIssue({
        code: "custom",
        message: "At least one phase duration must be greater than 0.",
        path: ["preliminaryDurationMinutes"],
      });
    }
  });

export const freeTestQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        sourceCollection: z.enum([
          "preliminary_questions",
          "written_questions",
        ]),
        questionId: z.string().regex(/^[a-f\d]{24}$/i),
      })
    )
    .min(0)
    .max(200),
});

export const freeTestUpdateSchema = z
  .object({
    ...freeTestFields,
    preliminaryDurationMinutes:
      freeTestFields.preliminaryDurationMinutes.removeDefault(),
    writtenDurationMinutes:
      freeTestFields.writtenDurationMinutes.removeDefault(),
    writtenQuestionsPerAttempt:
      freeTestFields.writtenQuestionsPerAttempt.removeDefault(),
    passMarkPercent: freeTestFields.passMarkPercent.removeDefault(),
    questionsPerAttempt: freeTestFields.questionsPerAttempt.removeDefault(),
    order: freeTestFields.order.removeDefault(),
  })
  .partial();
