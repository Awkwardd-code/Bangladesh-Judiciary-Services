import { ObjectId } from "mongodb";

import type { BaseDoc } from "./common";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentMethod = "bkash" | "nagad" | "bank";

export type Payment = BaseDoc & {
  userId: ObjectId;
  userName: string;
  userEmail: string;
  courseId: ObjectId;
  courseTitle: string;
  amount: number;
  currency: "BDT";
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  senderNumber: string;
  notes?: string;
  screenshotUrl?: string;
  screenshotPublicId?: string;
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  paidAt?: Date;
};
