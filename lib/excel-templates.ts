import * as XLSX from "xlsx";

export function downloadMCQTemplate(): void {
  const sheet = XLSX.utils.aoa_to_sheet([
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
    [
      1,
      "Which of the following is the correct statement?",
      "Option A",
      "Option B",
      "Option C",
      "Option D",
      "B",
      1,
      "Criminal Law",
      "Explain the rationale for the correct answer.",
    ],
    [
      2,
      "Which section governs this principle?",
      "Choice 1",
      "Choice 2",
      "Choice 3",
      "Choice 4",
      "C",
      1,
      "Constitutional Law",
      "Sample explanation.",
    ],
  ]);

  sheet["!cols"] = [
    { wch: 10 },
    { wch: 80 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 40 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "MCQ");
  XLSX.writeFile(workbook, "bjs-prep-mcq-template.xlsx");
}

export function downloadWrittenTemplate(): void {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["order", "question", "maxMarks", "subject"],
    [
      1,
      "Discuss the doctrine of res gestae in relation to the Evidence Act.",
      20,
      "Evidence",
    ],
    [
      2,
      "Explain the admissibility of hearsay evidence under the relevant law.",
      15,
      "Evidence",
    ],
  ]);

  sheet["!cols"] = [
    { wch: 10 },
    { wch: 100 },
    { wch: 15 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Written");
  XLSX.writeFile(workbook, "bjs-prep-written-template.xlsx");
}
