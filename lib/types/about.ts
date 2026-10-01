import { ObjectId } from "mongodb";

import { BaseDoc } from "./common";

export type AboutStat = {
  label: string;
  value: string;
};

export type AboutPillar = {
  title: string;
  description: string;
  iconName: string;
};

export type AboutComparisonRow = {
  scattered: string;
  bjsPrep: string;
};

export type About = BaseDoc & {
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  missionKicker: string;
  missionTitle: string;
  missionParagraphs: string[];
  approachKicker: string;
  approachTitle: string;
  approachPillars: AboutPillar[];
  whyKicker: string;
  whyTitle: string;
  whyComparisonRows: AboutComparisonRow[];
  facultyKicker: string;
  facultyTitle: string;
  stats: AboutStat[];
  updatedBy: ObjectId;
};

export type AboutShape = Omit<
  About,
  "_id" | "createdAt" | "updatedAt" | "updatedBy"
>;
