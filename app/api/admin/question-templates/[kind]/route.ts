import { NextRequest } from "next/server";

import { fail } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ kind: string }> },
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    const { kind } = await params;

    if (kind !== "mcq" && kind !== "written") {
      return fail("Unsupported template type.", 400);
    }

    const { utils, write } = await import("xlsx");

    const sheet =
      kind === "mcq"
        ? utils.aoa_to_sheet([
            [
              "order",
              "question",
              "optionA",
              "optionB",
              "optionC",
              "optionD",
              "correct",
              "marks",
              "subject",
              "explanation",
            ],
            [1, "Sample question", "A", "B", "C", "D", "A", 1, "Law", ""],
          ])
        : utils.aoa_to_sheet([
            ["order", "question", "maxMarks", "subject"],
            [1, "Sample written question", 20, "Evidence"],
          ]);

    if (kind === "mcq") {
      sheet["!cols"] = [
        { wch: 10 },
        { wch: 80 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
        { wch: 40 },
      ];
    } else {
      sheet["!cols"] = [
        { wch: 10 },
        { wch: 100 },
        { wch: 15 },
        { wch: 25 },
      ];
    }

    const workbook = utils.book_new();
    utils.book_append_sheet(
      workbook,
      sheet,
      kind === "mcq" ? "MCQ" : "Written",
    );

    const buffer = write(workbook, {
      type: "array",
      bookType: "xlsx",
    }) as ArrayBuffer;

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="bjs-prep-${kind}-template.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Template export error", error);
    return fail("Unable to generate template.", 500);
  }
}
