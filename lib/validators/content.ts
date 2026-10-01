import { z } from "zod";

export const mentorCreateSchema = z.object({
  name: z.string().min(2).max(120).trim(),
  title: z.string().min(2).max(160).trim(),
  bio: z.string().min(10).max(2000).trim(),
  specializations: z
    .array(z.string().min(2).max(80).trim())
    .max(10)
    .default([]),
  yearsOfExperience: z.number().int().min(0).max(80),
  order: z.number().int().min(0).max(9999).default(0),
  isPublished: z.boolean().default(true),
  photoUrl: z.string().url().or(z.literal("")).default(""),
  photoPublicId: z.string().trim().default(""),
});

export const mentorUpdateSchema = mentorCreateSchema.partial();

export const successStoryCreateSchema = z.object({
  authorName: z.string().min(2).max(120).trim(),
  authorEmail: z.string().email().toLowerCase().trim(),
  authorUniversity: z.string().min(2).max(160).trim(),
  authorBatch: z.string().min(1).max(40).trim(),
  quote: z.string().min(10).max(500).trim(),
  fullStory: z.string().max(5000).trim().optional(),
  achievement: z.string().min(2).max(200).trim(),
  yearOfSelection: z.number().int().min(1990).max(2100).optional(),
  isFeatured: z.boolean().default(false),
  order: z.number().int().min(0).max(9999).default(0),
});

export const successStoryUpdateSchema = successStoryCreateSchema.partial();

export const successStoryModerationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  isFeatured: z.boolean().optional(),
});

export const successStoryPublicSubmitSchema = successStoryCreateSchema.omit({
  isFeatured: true,
  order: true,
});

export const aboutUpdateSchema = z.object({
  heroKicker: z.string().min(1).max(80).trim(),
  heroTitle: z.string().min(1).max(300).trim(),
  heroSubtitle: z.string().min(1).max(500).trim(),
  missionKicker: z.string().min(1).max(80).trim(),
  missionTitle: z.string().min(1).max(300).trim(),
  missionParagraphs: z.array(z.string().min(10).max(2000).trim()).min(1).max(6),
  approachKicker: z.string().min(1).max(80).trim(),
  approachTitle: z.string().min(1).max(300).trim(),
  approachPillars: z
    .array(
      z.object({
        title: z.string().min(1).max(120).trim(),
        description: z.string().min(10).max(500).trim(),
        iconName: z.string().min(1).max(60).trim(),
      }),
    )
    .min(1)
    .max(8),
  whyKicker: z.string().min(1).max(80).trim(),
  whyTitle: z.string().min(1).max(300).trim(),
  whyComparisonRows: z
    .array(
      z.object({
        scattered: z.string().min(1).max(300).trim(),
        bjsPrep: z.string().min(1).max(300).trim(),
      }),
    )
    .min(1)
    .max(12),
  facultyKicker: z.string().min(1).max(80).trim(),
  facultyTitle: z.string().min(1).max(300).trim(),
  stats: z
    .array(
      z.object({
        label: z.string().min(1).max(80).trim(),
        value: z.string().min(1).max(40).trim(),
      }),
    )
    .min(0)
    .max(8),
});

export type MentorCreateInput = z.infer<typeof mentorCreateSchema>;
export type MentorUpdateInput = z.infer<typeof mentorUpdateSchema>;
export type SuccessStoryCreateInput = z.infer<typeof successStoryCreateSchema>;
export type SuccessStoryUpdateInput = z.infer<typeof successStoryUpdateSchema>;
export type SuccessStoryModerationInput = z.infer<
  typeof successStoryModerationSchema
>;
export type AboutUpdateInput = z.infer<typeof aboutUpdateSchema>;
