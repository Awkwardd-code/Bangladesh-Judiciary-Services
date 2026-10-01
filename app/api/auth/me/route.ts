import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-guard";
import { usersCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";

export async function GET() {
  const session = await requireSession();

  if (!session) {
    return fail("Not authenticated", 401);
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
        verified: user.verified,
        approved: user.approved,
        avatarUrl: user.avatarUrl ?? null,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile lookup error", error);
    return fail("Server error", 500);
  }
}
