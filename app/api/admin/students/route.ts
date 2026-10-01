import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { usersCol } from "@/lib/collections";
import { buildPaginationMeta } from "@/lib/pagination";
import { studentListQuerySchema } from "@/lib/validators/admin";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    const params = new URL(req.url).searchParams;
    const query = Object.fromEntries(
      [...params.entries()].filter(([, value]) => value !== "all"),
    );
    const parsed = studentListQuerySchema.safeParse(
      query,
    );

    if (!parsed.success) {
      return fail("Invalid student filters", 400);
    }

    const { page, limit, search, tier, status } = parsed.data;
    const filter: Record<string, unknown> = {};

    if (tier) {
      filter.tier = tier;
    }

    if (status === "verified") {
      filter.approved = true;
      filter.verified = true;
    }
    if (status === "unverified") {
      filter.approved = true;
      filter.verified = false;
    }
    if (status === "pending") filter.approved = false;

    if (search) {
      const expression = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { name: expression },
        { email: expression },
        { roll: expression },
        { university: expression },
        { studentId: expression },
      ];
    }

    const role = params.get("role");
    if (role === "admin") filter.isAdmin = 1;
    if (role === "student") filter.isAdmin = { $ne: 1 };

    const collection = await usersCol();
    const [users, total] = await Promise.all([
      collection
        .find(filter)
        .project({ password: 0 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return ok({
      students: users.map((user) => ({
        id: (user._id as ObjectId).toString(),
        name: user.name,
        email: user.email,
        roll: user.roll ?? user.studentId ?? "—",
        university: user.university ?? "—",
        tier: user.tier,
        role: user.isAdmin === 1 ? "admin" : "student",
        status: !user.approved
          ? "pending"
          : user.verified
            ? "verified"
            : "unverified",
        createdAt: user.createdAt,
        disabled: user.disabled === true,
      })),
      pagination: buildPaginationMeta({ page, limit }, total),
    });
  } catch (error) {
    console.error("List admin students error", error);
    return fail("Server error", 500);
  }
}
