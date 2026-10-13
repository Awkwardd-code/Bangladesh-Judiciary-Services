import { ObjectId } from "mongodb";

import { BaseDoc } from "./common";

export type CourseCategory = "BJS" | "BAR" | "LLB";
export type CourseType = "free" | "paid";
export type CourseStatus = "draft" | "published" | "archived";
export type CourseProgramKind = "course" | "exam";

export type CourseFeature = {
  label: string;
  value: string;
  iconName: string;
};

export type CourseModule = {
  title: string;
  description: string;
  order: number;
  estimatedHours: number;
};

export type CourseTopic = {
  _id: ObjectId;
  title: string;
  description: string;
  order: number;
  examIds: ObjectId[];
};

export type CourseRoutineItem = {
  title: string;
  description: string;
  scheduledAt: Date;
};

export type CategoryMeta = {
  code: CourseCategory;
  label: string;
  shortLabel: string;
  description: string;
  longDescription: string;
  iconName: string;
  heroTitle: string;
  heroSubtitle: string;
  accentTone: "primary" | "accent" | "dark";
};

export type SubSegmentKind = "lecture" | "video" | "live" | "note" | "material";

export type SubSegmentPayload = {
  videoUrl?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  link?: string;
  scheduledAt?: Date | string;
  recordingUrl?: string;
  pdfUrl?: string;
  pdfPublicId?: string;
  sizeBytes?: number;
  mimeType?: string;
  materialType?: "slides" | "book";
};

export type SubSegment = {
  _id: ObjectId | string;
  title: string;
  description: string;
  order: number;
  kind: SubSegmentKind;
  isFree: boolean;
  examIds: (ObjectId | string)[];
  payload: SubSegmentPayload;
};

export type Segment = {
  _id: ObjectId | string;
  title: string;
  description: string;
  order: number;
  isFree: boolean;
  price: number;
  discountedPrice?: number;
  examIds: (ObjectId | string)[];
  subSegments: SubSegment[];
};

export type Course = BaseDoc & {
  programKind?: CourseProgramKind;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  coverUrl?: string;
  coverPublicId?: string;

  category: CourseCategory;
  type: CourseType;
  tags: string[];
  level: "beginner" | "intermediate" | "advanced";

  price: number;
  currency: "BDT";
  discountPercent?: number;

  durationWeeks?: number;
  durationLabel: string;
  totalClasses: number;
  totalMockTests: number;
  totalMaterials: number;

  features?: CourseFeature[];
  modules?: CourseModule[];
  segments?: Segment[];
  topics?: CourseTopic[];
  routine?: CourseRoutineItem[];

  mentorIds: ObjectId[];

  isPublished: boolean;
  status: CourseStatus;
  order: number;

  createdBy: ObjectId;
};

export type SerializedSubSegment = {
  _id: string;
  title: string;
  description: string;
  order: number;
  kind: SubSegmentKind;
  isFree: boolean;
  hasClassNote?: boolean;
  examIds: string[];
  payload: {
    videoUrl?: string;
    thumbnailUrl?: string;
    durationMinutes?: number;
    link?: string;
    scheduledAt?: string;
    recordingUrl?: string;
    pdfUrl?: string;
    pdfPublicId?: string;
    sizeBytes?: number;
    mimeType?: string;
    materialType?: "slides" | "book";
  };
};

export type SerializedSegment = {
  _id: string;
  title: string;
  description: string;
  order: number;
  isFree: boolean;
  price: number;
  discountedPrice?: number;
  examIds: string[];
  subSegments: SerializedSubSegment[];
};

export const COURSE_CATEGORIES: CategoryMeta[] = [
  {
    code: "BJS",
    label: "BJS Programs",
    shortLabel: "BJS",
    description: "Bangladesh Judicial Service exam preparation.",
    longDescription:
      "Structured preparation for the Bangladesh Judicial Service preliminary and written examinations. Mentor-led courses, model tests, and written evaluation.",
    iconName: "Scale",
    heroTitle: "Prepare for the bench.",
    heroSubtitle:
      "Every BJS Program is built around the official syllabus and the actual exam pattern.",
    accentTone: "primary",
  },
  {
    code: "BAR",
    label: "BAR Programs",
    shortLabel: "BAR",
    description: "Bangladesh Bar Council exam preparation.",
    longDescription:
      "Comprehensive preparation for the Bar Council enrollment examination. Focused lectures, written practice, and mock tests.",
    iconName: "Gavel",
    heroTitle: "Clear the Bar with confidence.",
    heroSubtitle:
      "Programs designed around the Bar Council syllabus and previous exam patterns.",
    accentTone: "accent",
  },
  {
    code: "LLB",
    label: "LLB Academy",
    shortLabel: "LLB",
    description: "Academic support for LLB students.",
    longDescription:
      "Term-wise academic support for LLB students across all years. Lecture notes, video classes, and semester exam preparation.",
    iconName: "GraduationCap",
    heroTitle: "Master your LLB with structure.",
    heroSubtitle:
      "Support for every LLB year — lectures, materials, and exam practice.",
    accentTone: "dark",
  },
];

export function getCategoryMeta(code: CourseCategory): CategoryMeta {
  const found = COURSE_CATEGORIES.find((category) => category.code === code);
  if (found) return found;
  return COURSE_CATEGORIES[0];
}

export type EnrollmentStatus = "pending" | "approved" | "rejected" | "revoked";

export type Enrollment = BaseDoc & {
  courseId: ObjectId;
  userId: ObjectId;
  status: EnrollmentStatus;
  isPaid: boolean;
  paymentId?: ObjectId;
  approvedBy?: ObjectId;
  approvedAt?: Date;
  rejectedReason?: string;
  grantedAt: Date;
};
