import { ObjectId } from "mongodb";

import { getSessionFromCookies } from "@/lib/auth";
import type { SessionPayload } from "@/lib/auth";
import { usersCol } from "@/lib/collections";

export async function requireSession(): Promise<SessionPayload | null> {
  const payload = await getSessionFromCookies();

  if (!payload) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[auth-guard] no session cookie found");
    }
    return null;
  }

  try {
    const user = await (await usersCol()).findOne({
      _id: new ObjectId(payload.userId),
    });

    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth-guard] session user missing in database");
      }
      return null;
    }

    if (user.disabled === true) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth-guard] rejected disabled user");
      }
      return null;
    }

    const expectedVersion = user.sessionVersion ?? 1;
    const actualVersion = payload.v ?? 1;

    if (expectedVersion !== actualVersion) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth-guard] rejected stale session version", {
          expectedVersion,
          actualVersion,
          userId: user._id.toString(),
        });
      }
      return null;
    }

    const userRole = user.isAdmin === 1 ? "admin" : "student";

    if (userRole !== payload.role) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth-guard] role mismatch", {
          userRole,
          payloadRole: payload.role,
        });
      }
      return null;
    }

    return payload;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth-guard] session validation failed:", error);
    }
    return null;
  }
}

export async function requireAdmin(): Promise<SessionPayload | null> {
  const session = await requireSession();

  if (!session || session.role !== "admin") {
    return null;
  }

  return session;
}

export async function requireStudent(): Promise<SessionPayload | null> {
  const session = await requireSession();

  if (!session || session.role !== "student") {
    return null;
  }

  return session;
}
