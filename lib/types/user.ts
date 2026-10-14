import { BaseDoc } from "./common";

export type UserRole = "student" | "admin";
export type UserTier = "UNIVERSITY" | "OTHER";
export type UserGender = "male" | "female";

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
  gender?: UserGender;
  verified: boolean;
  approved: boolean;
  avatarUrl?: string;
  avatarPublicId?: string;
  freeExamsUsed?: number;
  freeExamsLimit?: number;
  lastLoginAt?: Date;
};

export type PublicUser = Omit<
  User,
  "password" | "sessionVersion" | "disabled"
>;
