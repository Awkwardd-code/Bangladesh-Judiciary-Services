import { z } from "zod";

export const noticeCreateSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  excerpt: z.string().min(10).max(300).trim(),
  body: z.string().min(20).max(10000).trim(),
  audience: z.enum(["all", "students", "university", "other"]).default("all"),
  pinned: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const noticeUpdateSchema = noticeCreateSchema.partial();
export type NoticeCreateInput = z.infer<typeof noticeCreateSchema>;
export type NoticeUpdateInput = z.infer<typeof noticeUpdateSchema>;
