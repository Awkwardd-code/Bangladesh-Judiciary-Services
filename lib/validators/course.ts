import { z } from "zod";

const courseTopicSchema = z.object({
  _id: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  title: z.string().min(2).max(120).trim(),
  description: z.string().max(500).trim().default(""),
  order: z.number().int().min(0).max(9999),
  examIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).default([]),
});

const courseVideoLectureSchema = z.object({
  _id: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  title: z.string().min(1).max(180).trim(),
  description: z.string().max(500).trim().optional().or(z.literal("")),
  source: z.enum(["YouTube", "Vimeo", "Drive", "Cloudinary"]),
  url: z.string().min(1).max(2000).trim(),
  thumbnailUrl: z.string().max(2000).trim().optional().or(z.literal("")),
  durationMinutes: z.number().int().min(1).max(600).optional(),
  isFree: z.boolean().optional(),
  order: z.number().int().min(0).max(9999).optional(),
});

const courseLiveLectureSchema = z.object({
  _id: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  title: z.string().min(1).max(180).trim(),
  description: z.string().max(500).trim().optional().or(z.literal("")),
  link: z.string().min(1).max(2000).trim(),
  scheduledAt: z.union([z.string().min(1), z.date()]).optional(),
  durationMinutes: z.number().int().min(1).max(600).optional(),
  recordingUrl: z.string().max(2000).trim().optional().or(z.literal("")),
  recordingThumbnailUrl: z
    .string()
    .max(2000)
    .trim()
    .optional()
    .or(z.literal("")),
  isFree: z.boolean().optional(),
  order: z.number().int().min(0).max(9999).optional(),
});

const courseMaterialSchema = z.object({
  _id: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  title: z.string().min(1).max(180).trim(),
  description: z.string().max(500).trim().optional().or(z.literal("")),
  type: z.enum(["Slides", "Book"]),
  url: z.string().max(2000).trim().optional().or(z.literal("")),
  publicId: z.string().max(200).trim().optional().or(z.literal("")),
  fileName: z.string().max(200).trim().optional().or(z.literal("")),
  mimeType: z.string().max(120).trim().optional().or(z.literal("")),
  sizeBytes: z.number().int().min(0).max(500000000).optional(),
  isFree: z.boolean().optional(),
  order: z.number().int().min(0).max(9999).optional(),
});

const courseSubSegmentPayloadSchema = z.object({
  videoUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  durationMinutes: z.number().int().min(0).max(600).optional(),
  link: z.string().url().optional(),
  scheduledAt: z.union([z.string(), z.date()]).optional(),
  recordingUrl: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
  pdfPublicId: z.string().optional(),
  sizeBytes: z.number().int().min(0).optional(),
  mimeType: z.string().optional(),
  materialType: z.enum(["slides", "book"]).optional(),
});

const courseSubSegmentSchema = z.object({
  _id: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  title: z.string().min(1).max(180).trim(),
  description: z.string().max(500).trim().default(""),
  order: z.number().int().min(0).max(9999).default(0),
  kind: z.enum(["lecture", "video", "live", "note", "material"]),
  isFree: z.boolean().default(false),
  examIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).default([]),
  payload: courseSubSegmentPayloadSchema.default({}),
});

const courseRoutineSchema = z.object({
  title: z.string().min(1).max(160).trim(),
  description: z.string().max(500).trim().default(""),
  scheduledAt: z.string().datetime(),
});

const courseSegmentSchema = z
  .object({
    _id: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .optional(),
    title: z.string().min(1).max(180).trim(),
    description: z.string().max(500).trim().default(""),
    order: z.number().int().min(0).max(9999).default(0),
    isFree: z.boolean().default(false),
    price: z.number().int().min(0).max(1000000).default(0),
    discountedPrice: z.number().int().min(0).max(1000000).optional(),
    examIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).default([]),
    subSegments: z.array(courseSubSegmentSchema).max(200).default([]),
  })
  .superRefine((segment, ctx) => {
    if (
      segment.discountedPrice !== undefined &&
      segment.discountedPrice > segment.price
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["discountedPrice"],
        message: "Discounted price cannot exceed the segment price.",
      });
    }
  });

export const courseCreateSchema = z
  .object({
    programKind: z.enum(["course", "exam"]).default("course"),
    title: z.string().min(3).max(200).trim(),
    slug: z
      .string()
      .min(3)
      .max(80)
      .regex(
        /^[a-z0-9-]+$/,
        "Use lowercase letters, numbers, and hyphens only."
      ),
    description: z.string().min(20).max(500).trim(),
    longDescription: z.string().min(50).max(5000).trim(),
    coverUrl: z.string().url().max(2000).optional().or(z.literal("")),
    coverPublicId: z.string().max(255).optional().or(z.literal("")),
    type: z.enum(["free", "paid"]).default("paid"),
    category: z.enum(["BJS", "BAR", "LLB"]),
    tags: z.array(z.string().max(40)).max(10).default([]),
    level: z
      .enum(["beginner", "intermediate", "advanced"])
      .default("intermediate"),
    price: z.number().min(0).max(1000000),
    discountPercent: z.number().int().min(0).max(100).optional(),
    durationWeeks: z.number().int().min(1).max(200),
    durationLabel: z.string().min(1).max(40).trim(),
    totalClasses: z.number().int().min(0).max(1000),
    totalMockTests: z.number().int().min(0).max(1000),
    totalMaterials: z.number().int().min(0).max(1000).default(0),
    features: z
      .array(
        z.object({
          label: z.string().min(1).max(80).trim(),
          value: z.string().min(1).max(80).trim(),
          iconName: z.string().min(1).max(60).trim(),
        })
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
        })
      )
      .max(50)
      .default([]),
    segments: z.array(courseSegmentSchema).max(100).default([]),
    topics: z.array(courseTopicSchema).max(30).default([]),
    routine: z.array(courseRoutineSchema).max(100).default([]),
    mentorIds: z
      .array(z.string().regex(/^[a-f\d]{24}$/i))
      .max(10)
      .default([]),
    isPublished: z.boolean().default(false),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    order: z.number().int().min(0).max(9999).default(0),
  })
  .superRefine((value, ctx) => {
    if (value.type === "free" && value.price !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Free courses must have a price of 0.",
      });
    }

    if (
      value.type === "paid" &&
      value.price <= 0 &&
      (value.programKind === "exam" || value.segments.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Paid courses must have a price greater than 0.",
      });
    }
  });

export const courseUpdateSchema = z
  .object({
    programKind: z.enum(["course", "exam"]).optional(),
    title: z.string().min(3).max(200).trim().optional(),
    slug: z
      .string()
      .min(3)
      .max(80)
      .regex(
        /^[a-z0-9-]+$/,
        "Use lowercase letters, numbers, and hyphens only."
      )
      .optional(),
    description: z.string().min(20).max(500).trim().optional(),
    longDescription: z.string().min(50).max(5000).trim().optional(),
    coverUrl: z.string().url().max(2000).optional().or(z.literal("")),
    coverPublicId: z.string().max(255).optional().or(z.literal("")),
    type: z.enum(["free", "paid"]).default("paid").optional(),
    category: z.enum(["BJS", "BAR", "LLB"]).optional(),
    tags: z.array(z.string().max(40)).max(10).default([]).optional(),
    level: z
      .enum(["beginner", "intermediate", "advanced"])
      .default("intermediate")
      .optional(),
    price: z.number().min(0).max(1000000).optional(),
    discountPercent: z.number().int().min(0).max(100).optional(),
    durationWeeks: z.number().int().min(1).max(200).optional(),
    durationLabel: z.string().min(1).max(40).trim().optional(),
    totalClasses: z.number().int().min(0).max(1000).optional(),
    totalMockTests: z.number().int().min(0).max(1000).optional(),
    totalMaterials: z.number().int().min(0).max(1000).default(0).optional(),
    features: z
      .array(
        z.object({
          label: z.string().min(1).max(80).trim(),
          value: z.string().min(1).max(80).trim(),
          iconName: z.string().min(1).max(60).trim(),
        })
      )
      .max(12)
      .default([])
      .optional(),
    modules: z
      .array(
        z.object({
          title: z.string().min(1).max(160).trim(),
          description: z.string().min(1).max(500).trim(),
          order: z.number().int().min(1).max(500),
          estimatedHours: z.number().min(0.5).max(500),
        })
      )
      .max(50)
      .default([])
      .optional(),
    segments: z.array(courseSegmentSchema).max(100).default([]).optional(),
    topics: z.array(courseTopicSchema).max(30).default([]).optional(),
    routine: z.array(courseRoutineSchema).max(100).default([]).optional(),
    mentorIds: z
      .array(z.string().regex(/^[a-f\d]{24}$/i))
      .max(10)
      .default([])
      .optional(),
    isPublished: z.boolean().default(false).optional(),
    status: z
      .enum(["draft", "published", "archived"])
      .default("draft")
      .optional(),
    order: z.number().int().min(0).max(9999).default(0).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.type === "free" &&
      value.price !== undefined &&
      value.price !== 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Free courses must have a price of 0.",
      });
    }

    if (
      value.type === "paid" &&
      value.price !== undefined &&
      value.price <= 0 &&
      (value.programKind === "exam" || !value.segments?.length)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Paid courses must have a price greater than 0.",
      });
    }
  });
