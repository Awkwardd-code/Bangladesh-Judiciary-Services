import { ObjectId } from "mongodb";

import { BaseDoc } from "./common";

export type CourseCategory =
  | "preliminary"
  | "written"
  | "viva"
  | "foundation";

export type CourseStatus = "draft" | "published" | "archived";

export type Course = BaseDoc & {
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  coverUrl?: string;
  coverPublicId?: string;
  category: CourseCategory;
  price: number;
  currency: "BDT";
  durationLabel: string;
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
