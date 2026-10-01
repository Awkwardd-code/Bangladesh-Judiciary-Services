import { ObjectId } from "mongodb";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { logAuth } from "@/lib/audit";
import { pendingRegistrationsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { sendRegistrationCodeEmail } from "@/lib/mailer";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { generateNumericCode } from "@/lib/tokens";
import { withGuard } from "@/lib/route-guard";

const schema = z.object({
  pendingId: z.string().regex(/^[a-f\d]{24}$/i),
});

export const POST = withGuard({ kind: "public" }, async (req) => {
  const limit = rateLimit({
    key: `resend-reg:${getClientIp(req)}`,
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
    return fail("Invalid request", 400);
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid request", 400);
  }

  try {
    await ensureIndexes();

    const pendingCollection = await pendingRegistrationsCol();
    const pending = await pendingCollection.findOne({
      _id: new ObjectId(parsed.data.pendingId),
    });

    if (!pending) {
      return fail("Session expired. Please register again.", 400);
    }

    const now = new Date();
    const code = generateNumericCode(8);

    await pendingCollection.updateOne(
      { _id: pending._id },
      {
        $set: {
          code,
          expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
          updatedAt: now,
        },
      },
    );

    await sendRegistrationCodeEmail(pending.email, code);
    await logAuth("register.resend", {
      email: pending.email,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });

    return ok({ message: "New code sent." });
  } catch (error) {
    console.error("Registration code resend error", error);
    return fail("Server error", 500);
  }
});
