import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { ObjectId } from "mongodb";

import { usersCol } from "@/lib/collections";
import { env } from "@/lib/env";
import { logAuth } from "@/lib/audit";

export type SessionPayload = {
  userId: string;
  role: "student" | "admin";
  isAdmin: 0 | 1;
  tier: "UNIVERSITY" | "OTHER";
  v: number;
  remember: boolean;
  ip?: string;
};

export const AUTH_COOKIE_NAME = "bjs_auth";
const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function signSession(
  payload: Omit<SessionPayload, "v" | "ip" | "remember"> & {
    v?: number;
    remember?: boolean;
    ip?: string;
  },
): Promise<string> {
  const claims: SessionPayload = {
    ...payload,
    v: payload.v ?? 1,
    remember: payload.remember ?? true,
    ...(env.SESSION_BIND_IP && payload.ip ? { ip: payload.ip } : {}),
  };

  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${env.SESSION_MAX_AGE_DAYS}d`)
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
      (payload.role !== "student" && payload.role !== "admin") ||
      (payload.isAdmin !== undefined &&
        payload.isAdmin !== 0 &&
        payload.isAdmin !== 1) ||
      (payload.tier !== "UNIVERSITY" && payload.tier !== "OTHER") ||
      (payload.v !== undefined &&
        (typeof payload.v !== "number" || !Number.isInteger(payload.v))) ||
      (payload.remember !== undefined && typeof payload.remember !== "boolean") ||
      (payload.ip !== undefined && typeof payload.ip !== "string")
    ) {
      return null;
    }

    const session: SessionPayload = {
      userId: payload.userId,
      role: payload.role,
      isAdmin:
        payload.isAdmin === 1 ||
        (payload.isAdmin === undefined && payload.role === "admin")
          ? 1
          : 0,
      tier: payload.tier,
      v: typeof payload.v === "number" ? payload.v : 1,
      remember:
        typeof payload.remember === "boolean" ? payload.remember : true,
      ...(typeof payload.ip === "string" ? { ip: payload.ip } : {}),
    };

    if (!ObjectId.isValid(session.userId)) {
      return null;
    }

    const user = await (await usersCol()).findOne({
      _id: new ObjectId(session.userId),
    });

    if (!user || user.disabled === true) {
      return null;
    }

    if ((user.sessionVersion ?? 1) !== session.v) {
      await logAuth("session.expired", {
        userId: user._id,
        email: user.email,
        ip: await getRequestIp(),
        userAgent: (await headers()).get("user-agent") ?? "unknown",
        meta: { reason: "version-mismatch" },
      });
      return null;
    }

    const currentRole = user.isAdmin === 1 ? "admin" : "student";

    if (currentRole !== session.role) {
      await logAuth("session.role-changed", {
        userId: user._id,
        email: user.email,
        ip: await getRequestIp(),
        userAgent: (await headers()).get("user-agent") ?? "unknown",
      });
      return null;
    }

    if (
      env.SESSION_BIND_IP &&
      (!session.ip || session.ip !== (await getRequestIp()))
    ) {
      return null;
    }

    return session;
  } catch {
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

export async function refreshSessionIfNeeded(
  token: string,
): Promise<string | null> {
  const session = await verifySession(token);

  if (!session) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    const issuedAt = typeof payload.iat === "number" ? payload.iat : 0;
    const ageSeconds = Math.floor(Date.now() / 1000) - issuedAt;
    const thresholdSeconds = env.SESSION_REFRESH_AFTER_DAYS * 24 * 60 * 60;

    if (ageSeconds < thresholdSeconds) {
      return null;
    }

    return signSession(session);
  } catch {
    return null;
  }
}

async function getRequestIp(): Promise<string> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown"
  );
}

export async function setSessionCookie(
  token: string,
  remember = true,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE || env.COOKIE_SAME_SITE === "none",
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
    ...(remember ? { maxAge: env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 } : {}),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.COOKIE_SECURE || env.COOKIE_SAME_SITE === "none",
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
    maxAge: 0,
  });
}
