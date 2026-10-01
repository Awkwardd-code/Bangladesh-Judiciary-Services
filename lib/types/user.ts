import { BaseDoc } from "./common";

export type UserRole = "student" | "admin";
export type UserTier = "UNIVERSITY" | "OTHER";

export type User = BaseDoc & {
  name: string;
  email: string;
  password: string;
  googleId?: string;
  role: UserRole;
  isAdmin: number;
  tier: UserTier;
  sessionVersion: number;
  disabled: boolean;
  roll?: string;
  university?: string;
  studentId?: string;
  phone?: string;
  verified: boolean;
  approved: boolean;
  avatarUrl?: string;
  avatarPublicId?: string;
  lastLoginAt?: Date;
};

export type PublicUser = Omit<
  User,
  "password" | "sessionVersion" | "disabled"
>;
