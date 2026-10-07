import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { ObjectId } from "mongodb";

export {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
} from "@/lib/auth-constants";

import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from "@/lib/auth-constants";
import { usersCol } from "@/lib/collections";
import { env } from "@/lib/env";

export type SessionPayload = {
  userId: string;
  role: "student" | "admin";
  tier: "UNIVERSITY" | "OTHER";
  v?: number;
  isAdmin?: 0 | 1;
  remember?: boolean;
  ip?: string;
};

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: AUTH_COOKIE_MAX_AGE,
};

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function signSession(payload: SessionPayload): Promise<string> {
  const claims = {
    ...payload,
    v: payload.v ?? 1,
    ...(payload.isAdmin !== undefined ? { isAdmin: payload.isAdmin } : {}),
    ...(payload.remember !== undefined
      ? { remember: payload.remember }
      : {}),
    ...(payload.ip ? { ip: payload.ip } : {}),
  };

  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId !== "string" ||
      !ObjectId.isValid(payload.userId) ||
      (payload.role !== "student" && payload.role !== "admin") ||
      (payload.tier !== "UNIVERSITY" && payload.tier !== "OTHER") ||
      (payload.v !== undefined &&
        (typeof payload.v !== "number" || !Number.isInteger(payload.v))) ||
      (payload.isAdmin !== undefined &&
        payload.isAdmin !== 0 &&
        payload.isAdmin !== 1) ||
      (payload.remember !== undefined && typeof payload.remember !== "boolean") ||
      (payload.ip !== undefined && typeof payload.ip !== "string")
    ) {
      return null;
    }

    const session: SessionPayload = {
      userId: payload.userId,
      role: payload.role,
      tier: payload.tier,
      v: typeof payload.v === "number" ? payload.v : 1,
      ...(payload.isAdmin !== undefined ? { isAdmin: payload.isAdmin } : {}),
      ...(payload.remember !== undefined ? { remember: payload.remember } : {}),
      ...(payload.ip !== undefined ? { ip: payload.ip } : {}),
    };

    return session;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] verifySession failed:", error);
    }
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

export async function setSessionCookie(
  token: string,
  options?: boolean | Partial<typeof AUTH_COOKIE_OPTIONS>,
): Promise<void> {
  const cookieStore = await cookies();

  const resolvedOptions =
    typeof options === "boolean"
      ? {
          ...AUTH_COOKIE_OPTIONS,
          maxAge: options ? AUTH_COOKIE_MAX_AGE : 60 * 60 * 24,
        }
      : {
          ...AUTH_COOKIE_OPTIONS,
          ...options,
        };

  cookieStore.set(AUTH_COOKIE_NAME, token, resolvedOptions);
}

export async function refreshSessionIfNeeded(
  token: string,
): Promise<string | null> {
  const session = await verifySession(token);

  if (!session) {
    return null;
  }

  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  const exp = payload.exp;
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (typeof exp !== "number") {
    return null;
  }

  if (exp - nowSeconds > 60 * 60 * 24) {
    return null;
  }

  const user = await (await usersCol()).findOne({
    _id: new ObjectId(session.userId),
  });

  if (!user || user.disabled === true) {
    return null;
  }

  const refreshed = await signSession({
    userId: session.userId,
    role: session.role,
    tier: session.tier,
    v: user.sessionVersion ?? session.v ?? 1,
    ...(session.isAdmin !== undefined ? { isAdmin: session.isAdmin } : {}),
    ...(session.remember !== undefined ? { remember: session.remember } : {}),
    ...(session.ip ? { ip: session.ip } : {}),
  });

  return refreshed;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export async function requireSessionFromToken(
  token: string,
): Promise<SessionPayload | null> {
  const session = await verifySession(token);

  if (!session) {
    return null;
  }

  const user = await (await usersCol()).findOne({
    _id: new ObjectId(session.userId),
  });

  if (!user || user.disabled === true) {
    return null;
  }

  const userRole = user.isAdmin === 1 ? "admin" : "student";
  const userVersion = user.sessionVersion ?? 1;

  if (userRole !== session.role) {
    return null;
  }

  if (userVersion !== (session.v ?? 1)) {
    return null;
  }

  return session;
}
