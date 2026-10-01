import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

export const successStoryCreateSchema = z.object({
  authorName: z.string().min(2).max(120).trim(),
  authorEmail: z.string().email().toLowerCase().trim(),
  authorUniversity: z.string().min(2).max(160).trim(),
  authorBatch: z.string().min(1).max(40).trim(),
  authorPhotoUrl: z.string().url().optional(),
  authorPhotoPublicId: z.string().optional(),
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

export const successStoryReorderSchema = z.object({
  orderedIds: z.array(objectId).min(1),
});
