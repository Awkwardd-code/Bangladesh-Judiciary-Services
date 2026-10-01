import { ObjectId } from "mongodb";
import { fail, ok } from "@/lib/api-response";
import { logAuth } from "@/lib/audit";
import { pendingRegistrationsCol, usersCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { hashPassword } from "@/lib/password";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { generateNumericCode } from "@/lib/tokens";
import { registerSchema } from "@/lib/validators/auth";
import { sendRegistrationCodeEmail } from "@/lib/mailer";
import { detectUniversityEmail } from "@/lib/university-email";
import { withGuard } from "@/lib/route-guard";

export const POST = withGuard({ kind: "public" }, async (req) => {
  const limit = rateLimit({
    key: `register:${getClientIp(req)}`,
    limit: 5,
    windowMs: 60_000,
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

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      parsed.error.issues[0]?.message ?? "Invalid request",
      400,
      { field: parsed.error.issues[0]?.path.join(".") },
    );
  }

  try {
    await ensureIndexes();

    const input = parsed.data;
    const detection = detectUniversityEmail(input.email);
    const studentId =
      detection.confidence === "high" ? detection.studentId : undefined;
    const university = detection.isUniversityEmail
      ? detection.university
      : undefined;
    const userCollection = await usersCol();
    const pendingCollection = await pendingRegistrationsCol();

    const existingUser = await userCollection.findOne({
      $or: [
        { email: input.email },
        ...(studentId ? [{ studentId }] : []),
      ],
    });

    if (existingUser) {
      return fail("An account with these details already exists", 409);
    }

    const now = new Date();
    const passwordHash = await hashPassword(input.password);
    const code = generateNumericCode(8);

    await pendingCollection.deleteMany({ email: input.email });

    const result = await pendingCollection.insertOne({
      _id: new ObjectId(),
      email: input.email,
      code,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      payload: {
        name: input.name,
        passwordHash,
        tier: "OTHER",
        university,
        studentId,
        phone: input.phone,
      },
      createdAt: now,
      updatedAt: now,
    });

    await logAuth("register.start", {
      email: input.email,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
      meta: { email: input.email },
    });

    try {
      await sendRegistrationCodeEmail(input.email, code);
    } catch (error) {
      console.error("Registration code email failed", error);
    }

    return ok(
      {
        pendingId: result.insertedId.toString(),
        message: "Verification code sent to your email.",
      },
      201,
    );
  } catch (error) {
    console.error("Registration error", error);
    return fail("Server error", 500);
  }
});
