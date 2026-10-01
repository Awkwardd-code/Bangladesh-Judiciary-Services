import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { withGuard } from "@/lib/route-guard";
import { TIMEOUTS, withTimeout } from "@/lib/with-timeout";

export const GET = withGuard({ kind: "public" }, async () => {
  let dbOk = false;

  try {
    const db = await getDb();
    await withTimeout(db.command({ ping: 1 }), TIMEOUTS.DB, "db health");
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return NextResponse.json({
    ok: true,
    env: process.env.NODE_ENV ?? "development",
    time: new Date().toISOString(),
    dbOk,
  });
});
