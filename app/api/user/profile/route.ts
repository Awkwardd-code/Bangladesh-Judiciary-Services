import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-guard";
import { usersCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const profileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().max(20).optional(),
    avatarUrl: z.string().url().nullable().optional(),
    avatarPublicId: z.string().trim().min(1).nullable().optional(),
  })
  .strict();

export async function GET() {
  const session = await requireSession();

  if (!session) {
    return fail("Not authenticated", 401);
  }

  try {
    await ensureIndexes();

    const user = await (
      await usersCol()
    ).findOne({
      _id: new ObjectId(session.userId),
    });

    if (!user) {
      return fail("User not found", 404);
    }

    return ok({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.isAdmin === 1 ? "admin" : "student",
        isAdmin: user.isAdmin,
        tier: user.tier,
        roll: user.roll ?? null,
        university: user.university ?? null,
        studentId: user.studentId ?? null,
        phone: user.phone ?? null,
        avatarUrl: user.avatarUrl ?? null,
        avatarPublicId: user.avatarPublicId ?? null,
        verified: user.verified,
        approved: user.approved,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt ?? null,
      },
    });
  } catch (error) {
    console.error("Profile lookup error", error);
    return fail("Server error", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireSession();

  if (!session) {
    return fail("Not authenticated", 401);
  }

  const limit = rateLimit({
    key: `profile:${getClientIp(req)}`,
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
    return fail("Invalid request", 400);
  }

  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid profile", 400);
  }

  try {
    await ensureIndexes();

    const userCollection = await usersCol();
    const user = await userCollection.findOne({
      _id: new ObjectId(session.userId),
    });

    if (!user) {
      return fail("User not found", 404);
    }

    const updateSet: Record<string, string | Date | null> = {
      updatedAt: new Date(),
    };

    if (parsed.data.name !== undefined) {
      updateSet.name = parsed.data.name;
    }

    if (parsed.data.phone !== undefined) {
      updateSet.phone = parsed.data.phone;
    }

    if (parsed.data.avatarUrl === null) {
      await userCollection.updateOne(
        { _id: user._id },
        {
          $unset: { avatarUrl: "", avatarPublicId: "" },
          $set: { updatedAt: new Date() },
        },
      );
    } else {
      if (parsed.data.avatarUrl !== undefined) {
        updateSet.avatarUrl = parsed.data.avatarUrl;
      }

      if (parsed.data.avatarPublicId !== undefined) {
        updateSet.avatarPublicId = parsed.data.avatarPublicId;
      }

      await userCollection.updateOne(
        { _id: user._id },
        {
          $set: updateSet,
        },
      );
    }

    const updatedUser = await userCollection.findOne({
      _id: user._id,
    });

    if (!updatedUser) {
      return fail("User not found", 404);
    }

    return ok({
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.isAdmin === 1 ? "admin" : "student",
        isAdmin: updatedUser.isAdmin,
        tier: updatedUser.tier,
        phone: updatedUser.phone ?? null,
        roll: updatedUser.roll ?? null,
        university: updatedUser.university ?? null,
        studentId: updatedUser.studentId ?? null,
        avatarUrl: updatedUser.avatarUrl ?? null,
        avatarPublicId: updatedUser.avatarPublicId ?? null,
        verified: updatedUser.verified,
        createdAt: updatedUser.createdAt,
        lastLoginAt: updatedUser.lastLoginAt ?? null,
      },
    });
  } catch (error) {
    console.error("Profile update error", error);
    return fail("Server error", 500);
  }
}
