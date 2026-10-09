import { z } from "zod";

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
      })
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
      })
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
      })
    )
    .min(0)
    .max(8),
});

export type AboutUpdateInput = z.infer<typeof aboutUpdateSchema>;
