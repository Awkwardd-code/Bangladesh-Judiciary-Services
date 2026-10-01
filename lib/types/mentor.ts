import { BaseDoc } from "./common";

export type Mentor = BaseDoc & {
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  photoPublicId: string;
  specializations: string[];
  yearsOfExperience: number;
  order: number;
  isPublished: boolean;
};

export type PublicMentor = Omit<Mentor, "photoPublicId">;

export type MentorRecord = Omit<Mentor, "_id" | "createdAt" | "updatedAt"> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
