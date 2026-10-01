import { z } from "zod";

export const mentorCreateSchema = z.object({
  name: z.string().min(2).max(120).trim(),
  title: z.string().min(2).max(160).trim(),
  bio: z.string().min(10).max(2000).trim(),
  photoUrl: z.string().url(),
  photoPublicId: z.string().min(1),
  specializations: z
    .array(z.string().min(2).max(80).trim())
    .min(1)
    .max(10),
  yearsOfExperience: z.number().int().min(0).max(80),
  order: z.number().int().min(0).max(9999).default(0),
  isPublished: z.boolean().default(true),
});

export const mentorUpdateSchema = mentorCreateSchema.partial();

export type MentorCreateInput = z.infer<typeof mentorCreateSchema>;
export type MentorUpdateInput = z.infer<typeof mentorUpdateSchema>;