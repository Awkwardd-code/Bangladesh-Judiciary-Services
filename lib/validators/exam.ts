import { z } from "zod";

const oid = z.string().regex(/^[a-f\d]{24}$/i);

export const examLevelSchema = z.object({
  _id: oid.optional(),
  title: z.string().min(1).max(160).trim(),
  kind: z.enum(["mcq", "written"]),
  questionIds: z.array(oid).max(500).default([]),
  durationMinutes: z.number().int().min(1).max(600),
  passMarkPercent: z.number().int().min(1).max(100),
  marks: z.number().min(0).max(10000).default(0),
});

export const examSubSegmentSchema = z
  .object({
    _id: oid.optional(),
    title: z.string().min(1).max(160).trim(),
    description: z.string().max(500).trim().default(""),
    order: z.number().int().min(0).max(9999),
    levels: z.array(examLevelSchema).length(2),
  })
  .refine(
    (v) => {
      const kinds = v.levels.map((l) => l.kind).sort();
      return kinds[0] === "mcq" && kinds[1] === "written";
    },
    {
      message:
        "Every week must have exactly one MCQ and one written level.",
    },
  );

export const examSegmentSchema = z.object({
  _id: oid.optional(),
  title: z.string().min(1).max(160).trim(),
  description: z.string().max(500).trim().default(""),
  order: z.number().int().min(0).max(9999),
  isFree: z.boolean().default(false),
  price: z.number().min(0).max(1000000).default(0),
  discountedPrice: z.number().min(0).max(1000000).optional(),
  subSegments: z.array(examSubSegmentSchema).max(20).default([]),
});

const examBaseObject = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(10).max(2000).trim(),
  thumbnailUrl: z.string().url().optional(),
  thumbnailPublicId: z.string().optional(),
  courseId: oid,
  segmentId: oid,
  subSegmentId: oid,
  kind: z.enum(["preliminary", "written"]),
  type: z.enum(["free", "paid"]).default("paid"),
  price: z.number().min(0).max(1000000).default(0),
  discountedPrice: z.number().min(0).max(1000000).optional(),
  validityMonths: z.number().int().min(1).max(120).default(12),
  discountTill: z.string().datetime().optional(),
  purchaseMode: z.enum(["complete", "specific"]).default("complete"),
  durationMinutes: z.number().int().min(5).max(600).default(60),
  passMarkPercent: z.number().int().min(1).max(100).default(50),
  negativeMarking: z.number().min(0).max(2).default(0),
  questionsPerAttempt: z.number().int().min(0).max(500).default(0),
  scheduledAt: z.string().datetime().optional(),
  closesAt: z.string().datetime().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  order: z.number().int().min(0).max(9999).default(0),
  segments: z.array(examSegmentSchema).default([]),
});

export const examCreateSchema = examBaseObject
  .refine(
    (v) => v.type !== "free" || v.price === 0,
    {
      message: "Free exams must have price = 0.",
      path: ["price"],
    },
  )
  .refine(
    (v) => v.type !== "paid" || v.price > 0,
    {
      message: "Paid exams must have price > 0.",
      path: ["price"],
    },
  );

export const examUpdateSchema = examBaseObject.partial().extend({
  scheduledAt: z.string().datetime().nullable().optional(),
  closesAt: z.string().datetime().nullable().optional(),
});

export const examSegmentsUpdateSchema = z.object({
  segments: z.array(examSegmentSchema).max(50).default([]),
});

export const examQuestionCreateSchema = z.object({
  order: z.number().int().min(1),
  questionText: z.string().min(5).max(5000).trim(),
  options: z.array(z.string().min(1).max(500)).length(4).optional(),
  correctOptionIndex: z.number().int().min(0).max(3).optional(),
  maxMarks: z.number().int().min(1).max(100).optional(),
  marks: z.number().min(0.5).max(100).default(1),
  subject: z.string().max(80).trim().optional(),
  explanation: z.string().max(2000).trim().optional(),
});

export const examQuestionUpdateSchema =
  examQuestionCreateSchema.partial();

export type ExamLevelInput =
  z.infer<typeof examLevelSchema>;

export type ExamSegmentInput =
  z.infer<typeof examSegmentSchema>;
