import * as XLSX from "xlsx";

export type ParsedMCQRow = {
  rowIndex: number;
  order: number | null;
  question: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
  subject: string;
  explanation: string;
};

export type ParsedWrittenRow = {
  rowIndex: number;
  order: number | null;
  question: string;
  maxMarks: number;
  subject: string;
};

export type ParseResult<T> = {
  rows: T[];
  errors: {
    rowIndex: number;
    message: string;
    raw?: Record<string, unknown>;
  }[];
};

type SheetRow = Record<string, unknown>;

function readSheetRows(buffer: Buffer): {
  rows: SheetRow[];
  errors: ParseResult<never>["errors"];
} {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;

    if (!sheet) {
      return {
        rows: [],
        errors: [
          { rowIndex: 1, message: "The workbook does not contain a sheet." },
        ],
      };
    }

    const rows = XLSX.utils.sheet_to_json<SheetRow>(sheet, {
      defval: "",
      blankrows: true,
    });

    return { rows, errors: [] };
  } catch (error) {
    return {
      rows: [],
      errors: [
        {
          rowIndex: 1,
          message:
            error instanceof Error ? error.message : "Unable to read workbook.",
        },
      ],
    };
  }
}

function normalizeRow(row: SheetRow): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, ""),
      value,
    ]),
  );
}

function valueText(value: unknown): string {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

function getText(row: Record<string, unknown>, key: string): string {
  return valueText(row[key]);
}

function getOptionalOrder(row: Record<string, unknown>): number | null {
  const rawOrder = getText(row, "order");

  if (!rawOrder) {
    return null;
  }

  const order = Number(rawOrder);

  if (!Number.isInteger(order) || order < 1) {
    throw new Error("Order must be a positive whole number.");
  }

  return order;
}

function parseCorrectOption(value: unknown): number {
  const answer = valueText(value).toUpperCase();
  const answerMap: Record<string, number> = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
  };
  const result = answerMap[answer];

  if (result === undefined) {
    throw new Error("Correct must be A, B, C, D, or a number from 0 to 3.");
  }

  return result;
}

function parseMarks(value: unknown): number {
  const rawMarks = valueText(value);
  const marks = Number(rawMarks);

  if (!rawMarks || Number.isNaN(marks) || marks < 0) {
    return 1;
  }

  if (marks > 10) {
    throw new Error("Marks cannot exceed 10.");
  }

  if (marks < 0.5) {
    throw new Error("Marks must be at least 0.5.");
  }

  return marks;
}

export function parseMCQSheet(buffer: Buffer): ParseResult<ParsedMCQRow> {
  const sheet = readSheetRows(buffer);
  const rows: ParsedMCQRow[] = [];
  const errors = [...sheet.errors];

  sheet.rows.forEach((raw, index) => {
    const rowIndex = index + 2;
    const normalized = normalizeRow(raw);

    if (Object.values(normalized).every((value) => !valueText(value))) {
      return;
    }

    try {
      const question = getText(normalized, "question");
      const options = ["optiona", "optionb", "optionc", "optiond"].map((key) =>
        getText(normalized, key),
      );

      if (question.length < 5) {
        throw new Error("Question must contain at least 5 characters.");
      }

      if (question.length > 2000) {
        throw new Error("Question cannot exceed 2000 characters.");
      }

      if (
        options.some((option) => option.length === 0 || option.length > 500)
      ) {
        throw new Error("Each option must contain 1 to 500 characters.");
      }

      const subject = getText(normalized, "subject");
      const explanation = getText(normalized, "explanation");

      if (subject.length > 80) {
        throw new Error("Subject cannot exceed 80 characters.");
      }

      if (explanation.length > 2000) {
        throw new Error("Explanation cannot exceed 2000 characters.");
      }

      rows.push({
        rowIndex,
        order: getOptionalOrder(normalized),
        question,
        options,
        correctOptionIndex: parseCorrectOption(normalized.correct),
        marks: parseMarks(normalized.marks),
        subject,
        explanation,
      });
    } catch (error) {
      errors.push({
        rowIndex,
        message: error instanceof Error ? error.message : "Invalid MCQ row.",
        raw,
      });
    }
  });

  return { rows, errors };
}

export function parseWrittenSheet(
  buffer: Buffer,
): ParseResult<ParsedWrittenRow> {
  const sheet = readSheetRows(buffer);
  const rows: ParsedWrittenRow[] = [];
  const errors = [...sheet.errors];

  sheet.rows.forEach((raw, index) => {
    const rowIndex = index + 2;
    const normalized = normalizeRow(raw);

    if (Object.values(normalized).every((value) => !valueText(value))) {
      return;
    }

    try {
      const question = getText(normalized, "question");
      const maxMarksText = getText(normalized, "maxmarks");
      const maxMarks = Number(maxMarksText);

      if (question.length < 5) {
        throw new Error("Question must contain at least 5 characters.");
      }

      if (question.length > 5000) {
        throw new Error("Question cannot exceed 5000 characters.");
      }

      if (
        !maxMarksText ||
        !Number.isFinite(maxMarks) ||
        maxMarks < 1 ||
        maxMarks > 100
      ) {
        throw new Error("Max marks must be a number between 1 and 100.");
      }

      const subject = getText(normalized, "subject");

      if (subject.length > 80) {
        throw new Error("Subject cannot exceed 80 characters.");
      }

      rows.push({
        rowIndex,
        order: getOptionalOrder(normalized),
        question,
        maxMarks,
        subject,
      });
    } catch (error) {
      errors.push({
        rowIndex,
        message:
          error instanceof Error
            ? error.message
            : "Invalid written question row.",
        raw,
      });
    }
  });

  return { rows, errors };
}
