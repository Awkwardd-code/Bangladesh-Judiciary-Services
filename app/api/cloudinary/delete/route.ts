import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-guard";
import { deleteFile } from "@/lib/cloudinary";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  publicId: z.string().trim().min(1),
});

export async function POST(req: NextRequest) {
  const session = await requireSession();

  if (!session) {
    return fail("Not authenticated", 401);
  }

  const limit = rateLimit({
    key: `cloudinary-delete:${getClientIp(req)}`,
    limit: 30,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return fail("Too many requests. Please try again later.", 429);
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return fail("Invalid request", 400);
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return fail("A valid public ID is required", 400);
  }

  try {
    await deleteFile(parsed.data.publicId, "image");
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    if (!message.includes("not found") && !message.includes("does not exist")) {
      console.error("Cloudinary deletion error", error);
      return fail("Unable to delete image", 500);
    }
  }

  return ok({ message: "Deleted." });
}
