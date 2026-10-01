import { ObjectId } from "mongodb";

import type { BaseDoc } from "./common";

export type NoticeStatus = "draft" | "published";
export type NoticeAudience = "all" | "students" | "university" | "other";

export type Notice = BaseDoc & {
  title: string;
  body: string;
  excerpt: string;
  status: NoticeStatus;
  audience: NoticeAudience;
  pinned: boolean;
  publishedAt?: Date;
  createdBy: ObjectId;
};

export type PublicNotice = Pick<
  Notice,
  "_id" | "title" | "body" | "excerpt" | "pinned" | "publishedAt" | "createdAt"
>;
