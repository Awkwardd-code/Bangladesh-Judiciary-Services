import type { NextRequest } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const entries = new Map<string, RateLimitEntry>();

// NOTE: This is in-memory and resets on cold start. For production scale,
// swap for Redis or Vercel KV.
export function rateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const existing = entries.get(options.key);

  if (!existing || existing.resetAt <= now) {
    const entry = { count: 1, resetAt: now + options.windowMs };
    entries.set(options.key, entry);
    return { allowed: true, remaining: options.limit - 1, resetAt: entry.resetAt };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= options.limit,
    remaining: Math.max(0, options.limit - existing.count),
    resetAt: existing.resetAt,
  };
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const requestWithIp = req as NextRequest & { ip?: string };
  return forwarded?.split(",")[0]?.trim() || requestWithIp.ip || "unknown";
}
