import { ObjectId } from "mongodb";

export type ContactMessageStatus = "unread" | "read" | "replied";

export type ContactMessage = {
  _id: ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
  userAgent: string;
  status: ContactMessageStatus;
  createdAt: Date;
  updatedAt: Date;
};