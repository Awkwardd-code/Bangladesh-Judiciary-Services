import { ObjectId } from "mongodb";

export type BaseDoc = {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
