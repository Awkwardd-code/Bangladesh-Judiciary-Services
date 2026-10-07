import type { ObjectId } from "mongodb";

import type { BaseDoc } from "./common";

export type MaterialKind = "pdf" | "doc" | "link";

export type Material = BaseDoc & {
  courseId: ObjectId;
  title: string;
  description?: string;
  kind: MaterialKind;
  url: string;
  publicId?: string;
  sizeBytes?: number;
  /** @deprecated Use sizeBytes. */
  size?: number;
  isFreePreview: boolean;
  order: number;
  createdBy: ObjectId;
};
