import { ObjectId } from "mongodb";

import { BaseDoc } from "./common";

export type SuccessStoryStatus = "pending" | "approved" | "rejected";

export type SuccessStory = BaseDoc & {
  authorName: string;
  authorEmail: string;
  authorUniversity: string;
  authorBatch: string;
  authorPhotoUrl?: string;
  authorPhotoPublicId?: string;
  quote: string;
  fullStory?: string;
  achievement: string;
  yearOfSelection?: number;
  status: SuccessStoryStatus;
  isFeatured: boolean;
  order: number;
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
};

export type PublicSuccessStory = Omit<
  SuccessStory,
  "authorEmail" | "authorPhotoPublicId" | "reviewedBy"
>;
