import { getSessionFromCookies } from "@/lib/auth";
import type { SessionPayload } from "@/lib/auth";

export async function requireSession(): Promise<SessionPayload | null> {
  try {
    return await getSessionFromCookies();
  } catch (error) {
    console.error("Session validation failed", error);
    return null;
  }
}

export async function requireAdmin(): Promise<SessionPayload | null> {
  const session = await requireSession();
  return session?.role === "admin" && session.isAdmin === 1 ? session : null;
}

export async function requireStudent(): Promise<SessionPayload | null> {
  const session = await requireSession();
  return session?.role === "student" ? session : null;
}
