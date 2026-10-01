import { ObjectId } from "mongodb";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { contactMessagesCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { withGuard } from "@/lib/route-guard";

const contactSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().toLowerCase().trim(),
  subject: z.string().min(3).max(160).trim(),
  message: z.string().min(10).max(3000).trim(),
});

export const POST = withGuard({ kind: "public" }, async (req) => {
  const ip = getClientIp(req);
  const limit = rateLimit({
    key: `contact:${ip}`,
    limit: 3,
    windowMs: 300_000,
  });

  if (!limit.allowed) {
    return fail("Too many requests. Please try again later.", 429);
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return fail("Invalid request body", 400);
  }

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];

    return fail(issue?.message ?? "Invalid contact message", 400, {
      field: issue?.path.join("."),
    });
  }

  try {
    await ensureIndexes();

    const now = new Date();
    await (await contactMessagesCol()).insertOne({
      _id: new ObjectId(),
      ...parsed.data,
      ip,
      userAgent: req.headers.get("user-agent") ?? "",
      status: "unread",
      createdAt: now,
      updatedAt: now,
    });

    return ok(
      {
        message: "Thanks for reaching out. We'll reply within 1-2 business days.",
      },
      201,
    );
  } catch (error) {
    console.error("Contact message submission error", error);
    return fail("Unable to send your message right now. Please try again later.", 500);
  }
});