import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { parseWrittenSheet } from "@/lib/excel";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const allowedTypes = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/octet-stream",
]);
const maxFileSize = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    const ip = getClientIp(req);
    const limit = rateLimit({
      key: `excel-parse:${ip}`,
      limit: 10,
      windowMs: 60_000,
    });

    if (!limit.allowed) {
      return fail("Too many requests. Please try again later.", 429);
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return fail("Choose a spreadsheet file to upload.", 400);
    }

    if (!allowedTypes.has(file.type)) {
      return fail("Upload an XLSX, XLS, or CSV file.", 400);
    }

    if (file.size > maxFileSize) {
      return fail("The spreadsheet must be 5 MB or smaller.", 400);
    }

    const parsed = parseWrittenSheet(Buffer.from(await file.arrayBuffer()));

    return ok({
      ...parsed,
      summary: {
        total: parsed.rows.length + parsed.errors.length,
        valid: parsed.rows.length,
        invalid: parsed.errors.length,
      },
    });
  } catch (error) {
    console.error("Written spreadsheet parse error", error);
    return fail("Unable to read this spreadsheet.", 400);
  }
}
