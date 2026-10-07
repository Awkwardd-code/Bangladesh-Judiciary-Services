import { ObjectId } from "mongodb";

import { BaseDoc } from "./common";

export type CourseCategory =
  | "preliminary"
  | "written"
  | "viva"
  | "foundation";

export type CourseStatus = "draft" | "published" | "archived";

export type CourseModule = {
  title: string;
  description: string;
  order: number;
  estimatedHours: number;
};

export type CourseFeature = {
  label: string;
  value: string;
  iconName: string;
};

export type Course = BaseDoc & {
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  coverUrl?: string;
  coverPublicId?: string;

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

  features: CourseFeature[];
  modules: CourseModule[];
  mentorIds: ObjectId[];

  isPublished: boolean;
  status: CourseStatus;
  order: number;

  createdBy: ObjectId;
};

export type EnrollmentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";

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
