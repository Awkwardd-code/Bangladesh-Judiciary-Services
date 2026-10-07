import { z } from "zod";

export const paymentSubmitSchema = z.object({
  courseId: z.string().regex(/^[a-f\d]{24}$/i),
  method: z.enum(["bkash", "nagad", "bank"]),
  senderNumber: z
    .string()
    .min(6)
    .max(30)
    .trim()
    .regex(/^[0-9+\-\s]+$/, "Use only digits, +, -, or spaces."),
  transactionId: z
    .string()
    .min(4)
    .max(80)
    .trim()
    .regex(/^[A-Za-z0-9\-]+$/, "Use letters, digits, and hyphens only."),
  notes: z.string().max(500).trim().optional(),
});

export const paymentCreateSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i),
  courseId: z.string().regex(/^[a-f\d]{24}$/i),
  amount: z.number().positive(),
  currency: z.literal("BDT"),
  method: z.enum(["bkash", "nagad", "bank"]),
  status: z.enum(["pending", "completed", "failed", "refunded"]),
  transactionId: z.string().trim().min(4).max(80).optional(),
  notes: z.string().max(500).trim().optional(),
});

export const paymentStatusUpdateSchema = z.object({
  status: z.enum(["pending", "completed", "failed", "refunded"]),
  rejectionReason: z.string().max(500).trim().optional(),
});
