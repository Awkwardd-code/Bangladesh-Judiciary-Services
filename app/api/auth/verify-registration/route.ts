import { ObjectId } from "mongodb";
import { fail, ok } from "@/lib/api-response";
import { logAuth } from "@/lib/audit";
import { setSessionCookie, signSession } from "@/lib/auth";
import { pendingRegistrationsCol, usersCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { verifyRegistrationSchema } from "@/lib/validators/auth";
import { withGuard } from "@/lib/route-guard";

export const POST = withGuard({ kind: "public" }, async (req) => {
  const limit = rateLimit({
    key: `verify-reg:${getClientIp(req)}`,
    limit: 10,
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

  const parsed = verifyRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
  }

  try {
    await ensureIndexes();

    const pendingCollection = await pendingRegistrationsCol();
    const userCollection = await usersCol();
    const pendingId = new ObjectId(parsed.data.pendingId);
    const pending = await pendingCollection.findOne({ _id: pendingId });

    if (!pending) {
      return fail("Verification session expired. Please register again.", 400);
    }

    if (pending.expiresAt.getTime() < Date.now()) {
      await pendingCollection.deleteOne({ _id: pendingId });
      return fail("Verification session expired. Please register again.", 400);
    }

    if (pending.code !== parsed.data.code) {
      return fail("Incorrect code", 400);
    }

    const conflict = await userCollection.findOne({
      $or: [
        { email: pending.email },
        ...(pending.payload.roll ? [{ roll: pending.payload.roll }] : []),
        ...(pending.payload.studentId
          ? [{ studentId: pending.payload.studentId }]
          : []),
      ],
    });

    if (conflict) {
      return fail("An account with these details already exists", 409);
    }

    const now = new Date();
    const result = await userCollection.insertOne({
      _id: new ObjectId(),
      name: pending.payload.name,
      email: pending.email,
      password: pending.payload.passwordHash,
      role: "student",
      isAdmin: 0,
      tier: pending.payload.tier,
      sessionVersion: 1,
      disabled: false,
      roll: pending.payload.roll,
      university: pending.payload.university,
      studentId: pending.payload.studentId,
      phone: pending.payload.phone,
      verified: true,
      approved: true,
      createdAt: now,
      updatedAt: now,
    });

    const token = await signSession({
      userId: result.insertedId.toString(),
      role: "student",
      isAdmin: 0,
      tier: pending.payload.tier,
      v: 1,
      ip: getClientIp(req),
    });

    await setSessionCookie(token);
    await pendingCollection.deleteOne({ _id: pendingId });
    await logAuth("register.verify", {
      userId: result.insertedId,
      email: pending.email,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });

    return ok({
      user: {
        id: result.insertedId.toString(),
        name: pending.payload.name,
        email: pending.email,
        role: "student",
        isAdmin: 0,
        tier: pending.payload.tier,
        verified: true,
      },
    });
  } catch (error) {
    console.error("Registration verification error", error);
    return fail("Server error", 500);
  }
});
