"use client";

import {
  AlertTriangle,
  Check,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

import {
  downloadMCQTemplate,
  downloadWrittenTemplate,
} from "@/lib/excel-template";
import { Button } from "@/components/ui/button";

type ImportKind = "mcq" | "written";

type PreviewRow = {
  rowIndex: number;
  order: number | null;
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  marks?: number;
  maxMarks?: number;
  subject?: string;
  explanation?: string;
};

type ImportIssue = {
  rowIndex: number;
  message: string;
};

type ImportExcelDialogProps = {
  examId: string;
  kind: ImportKind;
  onImported: (count: number) => void;
};

type Step = "upload" | "preview" | "importing";

export function ImportExcelDialog({
  examId,
  kind,
  onImported,
}: ImportExcelDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [errors, setErrors] = useState<ImportIssue[]>([]);
  const [fileName, setFileName] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("upload");
    setRows([]);
    setErrors([]);
    setFileName("");
    setReplaceExisting(false);
    setLoading(false);
    setUploadError(null);
    setImportError(null);
  }

  function close() {
    setOpen(false);
    reset();
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file) {
      void parseFile(file);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) {
      void parseFile(file);
    }
  }

  async function parseFile(file: File) {
    setLoading(true);
    setUploadError(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.set("file", file);
    const endpoint = kind === "mcq" ? "preliminary-exams" : "written-exams";

    try {
      const response = await fetch(
        `/api/admin/${endpoint}/${examId}/import/parse`,
        { method: "POST", body: formData },
      );
      const result = (await response.json()) as {
        error?: string;
        data?: { rows?: PreviewRow[]; errors?: ImportIssue[] };
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to parse spreadsheet.");
      }

      setRows(result.data?.rows ?? []);
      setErrors(result.data?.errors ?? []);
      setStep("preview");
    } catch (caughtError) {
      setUploadError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to parse spreadsheet.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmImport() {
    if (rows.length === 0) {
      return;
    }

    setStep("importing");
    setImportError(null);
    const endpoint = kind === "mcq" ? "preliminary-exams" : "written-exams";
    const orderedRows = rows.map((row) => ({
      ...row,
      order: row.order ?? row.rowIndex - 1,
    }));
    const normalizedRows =
      kind === "mcq"
        ? orderedRows.map((row) => ({
            order: row.order,
            questionText: row.question,
            options: row.options ?? [],
            correctOptionIndex: row.correctOptionIndex ?? 0,
            marks: row.marks ?? 1,
            subject: row.subject ?? "",
            explanation: row.explanation ?? "",
          }))
        : orderedRows.map((row) => ({
            order: row.order,
            questionText: row.question,
            maxMarks: row.maxMarks ?? 1,
            subject: row.subject ?? "",
          }));

    try {
      const response = await fetch(
        `/api/admin/${endpoint}/${examId}/import/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId,
            rows: normalizedRows,
            replaceExisting,
          }),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to import questions.");
      }

      const importedCount = rows.length;
      close();
      onImported(importedCount);
    } catch (caughtError) {
      setImportError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to import questions.",
      );
      setStep("preview");
    }
  }

  function downloadTemplate() {
    if (kind === "mcq") {
      downloadMCQTemplate();
    } else {
      downloadWrittenTemplate();
    }
  }

  const title = kind === "mcq" ? "MCQ" : "Written";

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="cursor-pointer"
      >
        <FileSpreadsheet size={16} />
        Import from Excel
      </Button>

      {open ? (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && step !== "importing") {
              close();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-excel-title"
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-card shadow-xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
              <div>
                <h2
                  id="import-excel-title"
                  className="font-heading text-xl font-bold text-primary"
                >
                  {step === "preview"
                    ? `Review ${rows.length} questions`
                    : step === "importing"
                      ? "Importing questions"
                      : `Import ${title} questions`}
                </h2>
                {step === "upload" ? (
                  <p className="mt-1 text-sm text-muted">
                    Upload an .xlsx, .xls, or .csv file. Columns are detected
                    automatically.
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={close}
                disabled={step === "importing"}
                aria-label="Close import dialog"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed"
              >
                <X size={18} />
              </button>
            </header>

            {step === "upload" ? (
              <div className="space-y-5 p-5 sm:p-6">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-accent hover:underline"
                >
                  <Download size={16} />
                  Download template
                </button>

                <label
                  htmlFor="exam-spreadsheet"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border text-center transition-colors hover:border-accent"
                >
                  {loading ? (
                    <Loader2 size={22} className="animate-spin text-accent" />
                  ) : (
                    <Upload size={22} className="text-muted" />
                  )}
                  <span className="mt-3 text-sm font-medium text-primary">
                    {loading
                      ? "Reading spreadsheet..."
                      : "Click to upload or drag and drop"}
                  </span>
                  <span className="mt-1 text-xs text-muted">
                    XLSX, XLS, or CSV up to 5 MB
                  </span>
                  {fileName ? (
                    <span className="mt-2 max-w-[90%] truncate text-xs text-muted">
                      {fileName}
                    </span>
                  ) : null}
                </label>
                <input
                  ref={fileInputRef}
                  id="exam-spreadsheet"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                {uploadError ? <ErrorAlert message={uploadError} /> : null}
              </div>
            ) : null}

            {step === "preview" ? (
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <Check size={13} />
                    {rows.length} valid
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                    <AlertTriangle size={13} />
                    {errors.length} with issues
                  </span>
                  <span className="ml-auto max-w-full truncate text-xs text-muted">
                    {fileName}
                  </span>
                </div>

                {errors.length > 0 ? (
                  <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    <ul className="space-y-1">
                      {errors.slice(0, 5).map((error) => (
                        <li key={`${error.rowIndex}-${error.message}`}>
                          Row {error.rowIndex}: {error.message}
                        </li>
                      ))}
                    </ul>
                    {errors.length > 5 ? (
                      <p className="mt-2">...and {errors.length - 5} more</p>
                    ) : null}
                  </div>
                ) : null}

                <div className="max-h-96 overflow-auto rounded-md border border-border">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="sticky top-0 bg-background text-xs text-muted">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Question</th>
                        {kind === "mcq" ? (
                          <>
                            <th className="px-3 py-2">Correct</th>
                            <th className="px-3 py-2">Marks</th>
                          </>
                        ) : (
                          <th className="px-3 py-2">Max marks</th>
                        )}
                        <th className="px-3 py-2">Subject</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row, index) => (
                        <tr key={`${row.rowIndex}-${index}`}>
                          <td className="px-3 py-2 text-muted">
                            {row.order ?? row.rowIndex - 1}
                          </td>
                          <td className="max-w-sm truncate px-3 py-2 text-primary">
                            {row.question}
                          </td>
                          {kind === "mcq" ? (
                            <>
                              <td className="px-3 py-2 text-muted">
                                {String.fromCharCode(
                                  65 + (row.correctOptionIndex ?? 0),
                                )}
                              </td>
                              <td className="px-3 py-2 text-muted">
                                {row.marks ?? 1}
                              </td>
                            </>
                          ) : (
                            <td className="px-3 py-2 text-muted">
                              {row.maxMarks}
                            </td>
                          )}
                          <td className="px-3 py-2 text-muted">
                            {row.subject || "—"}
                          </td>
                        </tr>
                      ))}
                      {rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={kind === "mcq" ? 5 : 4}
                            className="px-3 py-8 text-center text-muted"
                          >
                            No valid rows to preview.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(event) =>
                      setReplaceExisting(event.target.checked)
                    }
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  Replace existing questions for this exam
                </label>

                {importError ? <ErrorAlert message={importError} /> : null}

                <footer className="flex justify-end gap-3 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setImportError(null);
                      setStep("upload");
                    }}
                    className="h-10 cursor-pointer px-4 text-sm text-muted hover:text-primary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={rows.length === 0}
                    onClick={() => void confirmImport()}
                    className="h-10 cursor-pointer rounded-md bg-primary px-4 text-sm font-medium text-cream disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Import {rows.length} questions
                  </button>
                </footer>
              </div>
            ) : null}

            {step === "importing" ? (
              <div className="flex min-h-64 flex-col items-center justify-center p-8">
                <Loader2 size={28} className="animate-spin text-accent" />
                <p className="mt-4 text-sm text-muted">
                  Importing {rows.length} questions...
                </p>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
    >
      {message}
    </p>
  );
}
