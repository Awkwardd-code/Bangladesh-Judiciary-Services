import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { ok } from "@/lib/api-response";
import { clearSessionCookie, getSessionFromCookies } from "@/lib/auth";
import { logAuth } from "@/lib/audit";
import { usersCol } from "@/lib/collections";
import { getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  let session = null;

  try {
    session = await getSessionFromCookies();

    if (session) {
      await (await usersCol()).updateOne(
        { _id: new ObjectId(session.userId) },
        { $set: { sessionVersion: (session.v ?? 1) + 1, updatedAt: new Date() } },
      );
    }
  } finally {
    await clearSessionCookie();
  }

  if (session) {
    await logAuth("logout", {
      userId: new ObjectId(session.userId),
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });
  }

  return ok({ message: "Logged out." });
}
