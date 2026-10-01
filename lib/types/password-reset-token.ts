import { ObjectId } from "mongodb";

export type PasswordResetToken = {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};
