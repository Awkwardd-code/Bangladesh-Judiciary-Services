import type {
  SerializedSegment,
  SerializedSubSegment,
  SubSegmentKind,
} from "@/lib/types/course";

// NOTE: Skipped paths: none.

export function genTempId(): string {
  const hex = "0123456789abcdef";
  let out = "";

  for (let i = 0; i < 24; i += 1) {
    out += hex[Math.floor(Math.random() * 16)];
  }

  return out;
}

export function reindexOrders<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const copy = items.slice();
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

export function makeEmptySegment(order: number): SerializedSegment {
  return {
    _id: genTempId(),
    title: `Module ${order + 1}`,
    description: "",
    order,
    isFree: true,
    price: 0,
    examIds: [],
    subSegments: [],
  };
}

export function makeEmptySubSegment(
  order: number,
  kind: SubSegmentKind = "lecture"
): SerializedSubSegment {
  return {
    _id: genTempId(),
    title: kind === "lecture" ? "Class Lecture" : "Class Note",
    description: "",
    order,
    kind,
    isFree: false,
    examIds: [],
    payload: {},
  };
}

export function kindToLabel(kind: SubSegmentKind): string {
  switch (kind) {
    case "lecture":
      return "Class Lecture";
    case "video":
      return "Video";
    case "live":
      return "Live";
    case "note":
      return "Class Note";
    case "material":
      return "Material";
    default:
      return "Content";
  }
}

export function normalizePayload<T extends SerializedSubSegment>(
  subSegment: T
): T {
  return {
    ...subSegment,
    payload: {
      ...subSegment.payload,
      scheduledAt: subSegment.payload.scheduledAt ?? undefined,
    },
  };
}
