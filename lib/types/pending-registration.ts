import { ObjectId } from "mongodb";

import { UserTier } from "./user";

export type PendingRegistrationPayload = {
  name: string;
  passwordHash: string;
  tier: UserTier;
  roll?: string;
  university?: string;
  studentId?: string;
  phone?: string;
};

export type PendingRegistration = {
  _id: ObjectId;
  email: string;
  code: string;
  expiresAt: Date;
  payload: PendingRegistrationPayload;
  createdAt: Date;
  updatedAt: Date;
};
