import { z } from "zod";

export const courseCreateSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(
      /^[a-z0-9-]+$/,
      "Use lowercase letters, numbers, and hyphens only.",
    ),
  description: z.string().min(20).max(500).trim(),
  longDescription: z.string().min(50).max(5000).trim(),
  category: z.enum(["preliminary", "written", "viva", "foundation"]),
  tags: z.array(z.string().max(40)).max(10).default([]),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  price: z.number().min(0).max(1000000),
  discountPercent: z.number().int().min(0).max(100).optional(),
  durationWeeks: z.number().int().min(1).max(200),
  durationLabel: z.string().min(1).max(40).trim(),
  totalClasses: z.number().int().min(0).max(1000),
  totalMockTests: z.number().int().min(0).max(1000),
  totalMaterials: z.number().int().min(0).max(1000),
  features: z
    .array(
      z.object({
        label: z.string().min(1).max(80).trim(),
        value: z.string().min(1).max(80).trim(),
        iconName: z.string().min(1).max(60).trim(),
      }),
    )
    .max(12)
    .default([]),
  modules: z
    .array(
      z.object({
        title: z.string().min(1).max(160).trim(),
        description: z.string().min(1).max(500).trim(),
        order: z.number().int().min(1).max(500),
        estimatedHours: z.number().min(0.5).max(500),
      }),
    )
    .max(50)
    .default([]),
  mentorIds: z
    .array(z.string().regex(/^[a-f\d]{24}$/i))
    .max(10)
    .default([]),
  isPublished: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  order: z.number().int().min(0).max(9999).default(0),
});

export const courseUpdateSchema = courseCreateSchema.partial();
