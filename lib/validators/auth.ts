import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2).max(80).trim(),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(72),
    phone: z.string().trim().max(20).optional(),
  })
  .strict();

export const verifyRegistrationSchema = z.object({
  pendingId: z.string().regex(/^[a-f\d]{24}$/i),
  code: z.string().regex(/^\d{8}$/),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  code: z.string().length(15),
  password: z.string().min(8).max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyRegistrationInput = z.infer<typeof verifyRegistrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
