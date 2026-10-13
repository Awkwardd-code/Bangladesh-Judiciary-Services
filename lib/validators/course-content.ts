import { z } from "zod";

const oid = z.string().regex(/^[a-f\d]{24}$/i);

export const subSegmentPayloadSchema = z.object({
  videoUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  durationMinutes: z.number().min(0).max(600).optional(),
  link: z.string().url().optional(),
  scheduledAt: z.string().optional(),
  recordingUrl: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
  pdfPublicId: z.string().optional(),
  sizeBytes: z.number().int().min(0).optional(),
  mimeType: z.string().optional(),
  materialType: z.enum(["slides", "book"]).optional(),
});

export const subSegmentSchema = z.object({
  _id: oid.optional(),
  title: z.string().min(1).max(160).trim(),
  description: z.string().max(1000).trim().default(""),
  order: z.number().int().min(0).max(9999),
  kind: z.enum(["lecture", "video", "live", "note", "material"]),
  isFree: z.boolean().default(false),
  examIds: z.array(oid).default([]),
  payload: subSegmentPayloadSchema.default({}),
});

export const segmentSchema = z
  .object({
    _id: oid.optional(),
    title: z.string().min(1).max(160).trim(),
    description: z.string().max(1000).trim().default(""),
    order: z.number().int().min(0).max(9999),
    isFree: z.boolean().default(false),
    price: z.number().int().min(0).max(1000000).default(0),
    discountedPrice: z.number().int().min(0).max(1000000).optional(),
    examIds: z.array(oid).default([]),
    subSegments: z.array(subSegmentSchema).max(50).default([]),
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

export const segmentsUpdateSchema = z.object({
  segments: z.array(segmentSchema).max(50).default([]),
});
