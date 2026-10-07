import * as XLSX from "xlsx";

export type ParsedMCQRow = {
  rowIndex: number;
  order: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
  subject: string;
  explanation: string;
};

export type ParsedWrittenRow = {
  rowIndex: number;
  order: number;
  question: string;
  maxMarks: number;
  subject: string;
};

export type RowError = {
  rowIndex: number;
  message: string;
  field?: string;
  raw?: Record<string, unknown>;
};

export type ParseResult<T> = {
  rows: T[];
  errors: RowError[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
};

function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[_-]+/g, "");
}

function safeText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  return "";
}

function parseOrder(raw: unknown, rowIndex: number): number {
  const value = safeText(raw);

  if (!value) {
    return rowIndex - 1;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return rowIndex - 1;
  }

  return parsed;
}

function parseMCQCorrect(value: unknown): number | null {
  const text = safeText(value).toLowerCase();

  if (!text) {
    return null;
  }

  if (text === "a" || text === "0") {
    return 0;
  }

  if (text === "b" || text === "1") {
    return 1;
  }

  if (text === "c" || text === "2") {
    return 2;
  }

  if (text === "d" || text === "3") {
    return 3;
  }

  return null;
}

function parseFloatValue(raw: unknown, fallback: number): number {
  const text = safeText(raw);

  if (!text) {
    return fallback;
  }

  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseMCQBuffer(buffer: Buffer): ParseResult<ParsedMCQRow> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    return {
      rows: [],
      errors: [],
      summary: { total: 0, valid: 0, invalid: 0 },
    };
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  const result: ParseResult<ParsedMCQRow> = {
    rows: [],
    errors: [],
    summary: { total: rows.length, valid: 0, invalid: 0 },
  };

  rows.forEach((row, index) => {
    const rowIndex = index + 2;
    const normalized = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        normalizeHeader(key),
        value,
      ]),
    ) as Record<string, unknown>;

    const parsedOrder = parseOrder(normalized.order, rowIndex);
    const question = safeText(normalized.question);
    const optionA = safeText(normalized.optiona);
    const optionB = safeText(normalized.optionb);
    const optionC = safeText(normalized.optionc);
    const optionD = safeText(normalized.optiond);
    const correctValue = parseMCQCorrect(normalized.correct);
    const marks = parseFloatValue(normalized.marks, 1);
    const subject = safeText(normalized.subject);
    const explanation = safeText(normalized.explanation);

    if (question.length < 5 || question.length > 2000) {
      result.errors.push({
        rowIndex,
        field: "question",
        message: "Question text is too short (minimum 5 characters).",
        raw: normalized,
      });
      return;
    }

    const options = [optionA, optionB, optionC, optionD];

    for (let index = 0; index < options.length; index += 1) {
      const option = options[index];
      const letter = ["A", "B", "C", "D"][index];

      if (!option) {
        result.errors.push({
          rowIndex,
          field: `option${letter.toLowerCase()}`,
          message: `Option ${letter} is empty.`,
          raw: normalized,
        });
        return;
      }

      if (option.length > 500) {
        result.errors.push({
          rowIndex,
          field: `option${letter.toLowerCase()}`,
          message: `Option ${letter} is too long (maximum 500 characters).`,
          raw: normalized,
        });
        return;
      }
    }

    if (correctValue === null) {
      result.errors.push({
        rowIndex,
        field: "correct",
        message: "The 'correct' value must be A, B, C, or D.",
        raw: normalized,
      });
      return;
    }

    if (Number.isNaN(marks) || marks < 0.5 || marks > 10) {
      result.errors.push({
        rowIndex,
        field: "marks",
        message: "Marks must be between 0.5 and 10.",
        raw: normalized,
      });
      return;
    }

    if (subject.length > 80) {
      result.errors.push({
        rowIndex,
        field: "subject",
        message: "Subject is too long (maximum 80 characters).",
        raw: normalized,
      });
      return;
    }

    if (explanation.length > 2000) {
      result.errors.push({
        rowIndex,
        field: "explanation",
        message: "Explanation is too long (maximum 2000 characters).",
        raw: normalized,
      });
      return;
    }

    result.rows.push({
      rowIndex,
      order: parsedOrder,
      question,
      options,
      correctOptionIndex: correctValue,
      marks,
      subject,
      explanation,
    });
  });

  result.summary = {
    total: result.rows.length + result.errors.length,
    valid: result.rows.length,
    invalid: result.errors.length,
  };

  return result;
}

export function parseWrittenBuffer(buffer: Buffer): ParseResult<ParsedWrittenRow> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    return {
      rows: [],
      errors: [],
      summary: { total: 0, valid: 0, invalid: 0 },
    };
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  const result: ParseResult<ParsedWrittenRow> = {
    rows: [],
    errors: [],
    summary: { total: rows.length, valid: 0, invalid: 0 },
  };

  rows.forEach((row, index) => {
    const rowIndex = index + 2;
    const normalized = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        normalizeHeader(key),
        value,
      ]),
    ) as Record<string, unknown>;

    const parsedOrder = parseOrder(normalized.order, rowIndex);
    const question = safeText(normalized.question);
    const subject = safeText(normalized.subject);
    const maxMarksValue = Number(safeText(normalized.maxmarks ?? normalized.maxmarks));
    const maxMarks = Number.isFinite(maxMarksValue)
      ? maxMarksValue
      : Number.NaN;

    if (question.length < 5 || question.length > 5000) {
      result.errors.push({
        rowIndex,
        field: "question",
        message: "Question text is too short (minimum 5 characters).",
        raw: normalized,
      });
      return;
    }

    if (!Number.isInteger(maxMarks) || maxMarks < 1 || maxMarks > 100) {
      result.errors.push({
        rowIndex,
        field: "maxMarks",
        message: "Max marks must be an integer between 1 and 100.",
        raw: normalized,
      });
      return;
    }

    if (subject.length > 80) {
      result.errors.push({
        rowIndex,
        field: "subject",
        message: "Subject is too long (maximum 80 characters).",
        raw: normalized,
      });
      return;
    }

    result.rows.push({
      rowIndex,
      order: parsedOrder,
      question,
      maxMarks: Number(maxMarks),
      subject,
    });
  });

  result.summary = {
    total: result.rows.length + result.errors.length,
    valid: result.rows.length,
    invalid: result.errors.length,
  };

  return result;
}
