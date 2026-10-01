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
      "1",
      "Under the CrPC, within what period must an arrested person be forwarded to a Magistrate?",
      "12 hours",
      "24 hours",
      "36 hours",
      "48 hours",
      "B",
      1,
      "Criminal Law",
      "Section 61 of the CrPC.",
    ],
    [
      "2",
      "Which court is empowered to take cognizance of an offence?",
      "Civil Court",
      "Criminal Court",
      "Revenue Court",
      "Family Court",
      "B",
      1,
      "Criminal Law",
      "",
    ],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "MCQ Questions");
  XLSX.writeFile(workbook, "bjs-prep-mcq-template.xlsx");
}

export function downloadWrittenTemplate(): void {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["order", "question", "maxMarks", "subject"],
    [
      "1",
      "Discuss the doctrine of res gestae with reference to the Evidence Act.",
      20,
      "Evidence",
    ],
    [
      "2",
      "Explain the principles governing the admissibility of evidence.",
      15,
      "Evidence",
    ],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Written Questions");
  XLSX.writeFile(workbook, "bjs-prep-written-template.xlsx");
}
