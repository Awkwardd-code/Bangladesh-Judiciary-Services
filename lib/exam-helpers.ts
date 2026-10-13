import type {
  SerializedExam,
  SerializedExamSegment,
  SerializedExamLevel,
  SerializedExamSubSegment,
} from "@/lib/types/exam";

export function genTempId(): string {
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 24; i += 1) {
    out += hex[Math.floor(Math.random() * 16)];
  }
  return out;
}

export function makeEmptyExamLevel(
  kind: "mcq" | "written"
): SerializedExamLevel {
  return {
    _id: genTempId(),
    title: kind === "mcq" ? "MCQ Test" : "Written Exam",
    kind,
    questionIds: [],
    durationMinutes: kind === "mcq" ? 30 : 60,
    passMarkPercent: 50,
    marks: 0,
  };
}

export function makeEmptyExamSubSegment(
  order: number
): SerializedExamSubSegment {
  return {
    _id: genTempId(),
    title: `Week ${order + 1}`,
    description: "",
    order,
    levels: [
      makeEmptyExamLevel("mcq"),
      makeEmptyExamLevel("written"),
    ],
  };
}

export function makeEmptyExamSegment(
  order: number
): SerializedExamSegment {
  return {
    _id: genTempId(),
    title: `Month ${order + 1}`,
    description: "",
    order,
    isFree: false,
    price: 0,
    subSegments: [],
  };
}

export function reindexOrders<
  T extends { order: number }
>(items: T[]): T[] {
  return items.map((item, i) => ({
    ...item,
    order: i,
  }));
}

export function moveItem<T>(
  items: T[],
  from: number,
  to: number
): T[] {
  const copy = items.slice();
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

export function getSegmentPriceLabel(
  segment: SerializedExamSegment
): string {
  if (segment.isFree) {
    return "Free";
  }
  const d = segment.discountedPrice ??
    segment.price ?? 0;
  return `৳ ${d.toLocaleString()}`;
}

export function getExamTotalMarks(
  exam: SerializedExam
): number {
  let total = 0;
  for (const seg of exam.segments) {
    for (const sub of seg.subSegments) {
      for (const level of sub.levels) {
        total += level.marks;
      }
    }
  }
  return total;
}

export function getExamTotalQuestions(
  exam: SerializedExam
): number {
  const seen = new Set<string>();
  for (const seg of exam.segments) {
    for (const sub of seg.subSegments) {
      for (const level of sub.levels) {
        for (const qid of level.questionIds) {
          seen.add(qid);
        }
      }
    }
  }
  return seen.size;
}
