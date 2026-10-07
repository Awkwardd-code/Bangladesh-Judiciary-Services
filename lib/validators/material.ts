import { z } from "zod";

export const materialCreateSchema = z.object({
  courseId: z.string().regex(/^[a-f\d]{24}$/i),
  title: z.string().min(2).max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  kind: z.enum(["pdf", "link", "doc"]),
  url: z.string().url(),
  publicId: z.string().optional(),
  sizeBytes: z.number().int().min(0).optional(),
  isFreePreview: z.boolean().default(false),
  order: z.number().int().min(0).max(9999).default(0),
});

export const materialUpdateSchema = materialCreateSchema
  .partial()
  .omit({ courseId: true });
