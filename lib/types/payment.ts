import { ObjectId } from "mongodb";

import type { BaseDoc } from "./common";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentMethod = "bkash" | "nagad" | "bank";

export type Payment = BaseDoc & {
  userId: ObjectId;
  userName: string;
  userEmail: string;
  amount: number;
  currency: "BDT";
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  notes?: string;
  paidAt?: Date;
};
