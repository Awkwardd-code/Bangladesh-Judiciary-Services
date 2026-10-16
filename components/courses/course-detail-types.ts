import type { CourseCategory } from "@/lib/types/course";
import type { SerializedSegment } from "@/lib/types/course";

export type CourseDetail = {
  id: string;
  programKind?: "course" | "exam";
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  coverUrl?: string;
  category: CourseCategory;
  tags: string[];
  level: "beginner" | "intermediate" | "advanced";
  price: number;
  currency: "BDT";
  discountPercent?: number;
  durationWeeks: number;
  durationLabel: string;
  totalClasses: number;
  totalMockTests: number;
  totalMaterials: number;
  lessonCount: number;
  pdfNoteCount: number;
  studentCount: number;
  features: Array<{
    label: string;
    value: string;
    iconName: string;
  }>;
  modules: Array<{
    title: string;
    description: string;
    order: number;
    estimatedHours: number;
  }>;
  segments: SerializedSegment[];
  topics?: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
  }>;
  routine?: Array<{
    title: string;
    description: string;
    scheduledAt: string;
  }>;
  tests?: Array<{
    id: string;
    source: "unified" | "preliminary" | "written";
    title: string;
    kind: "preliminary" | "written";
    totalQuestions: number;
    isLocked?: boolean;
    segmentId: string;
    subSegmentId: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type CourseMentor = {
  id: string;
  name: string;
  title: string;
  photoUrl?: string;
  specializations: string[];
  yearsOfExperience: number;
};

export type CourseMaterialPreview = {
  id: string;
  title: string;
  description?: string;
  kind: "pdf" | "doc" | "link";
  url?: string;
  sizeBytes?: number;
  isFreePreview: boolean;
};

export type CourseAccess = {
  hasAccess: boolean;
  reason: "free" | "approved" | "pending" | "rejected" | "none";
};
