import { z } from "zod";

export const enrollmentCreateSchema = z.object({
  courseId: z.string().regex(/^[a-f\d]{24}$/i),
  note: z.string().max(500).trim().optional(),
});

export const enrollmentDecisionSchema = z.object({
  status: z.enum(["approved", "rejected", "revoked"]),
  reason: z.string().max(500).trim().optional(),
});
