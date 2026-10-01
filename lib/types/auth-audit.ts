import type { ObjectId } from "mongodb";

export type AuthAuditAction =
  | "login.success"
  | "login.failure"
  | "login.blocked"
  | "logout"
  | "register.start"
  | "register.verify"
  | "register.resend"
  | "password.forgot"
  | "password.reset"
  | "password.change"
  | "session.expired"
  | "session.role-changed"
  | "admin.action";

export type AuthAudit = {
  _id: ObjectId;
  userId?: ObjectId;
  email?: string;
  action: AuthAuditAction;
  ip: string;
  userAgent: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
};