import type { Metadata } from "next";

import { AboutApproach } from "@/components/sections/about-approach";
import { AboutFaculty } from "@/components/sections/about-faculty";
import { AboutHero } from "@/components/sections/about-hero";
import { AboutMission } from "@/components/sections/about-mission";
import { AboutStories } from "@/components/sections/about-stories";
import { AboutWhy } from "@/components/sections/about-why";
import { CtaBand } from "@/components/sections/cta-band";
import {
  aboutsCol,
  mentorsCol,
  successStoriesCol,
} from "@/lib/collections";
import { defaultAboutSeed } from "@/lib/seed/about-default";
import type { About, AboutShape } from "@/lib/types/about";
import type { PublicMentor } from "@/lib/types/mentor";
import type { PublicSuccessStory } from "@/lib/types/success-story";

export const metadata: Metadata = {
  title: "About — BJS Prep",
  description:
    "Built to prepare serious candidates for the Bangladesh Judicial Service exam.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const about = await safeFetch<AboutShape>(
    "about content",
    async () => {
      try {
        const record = await (await aboutsCol()).findOne({});
        return normalizeAbout(record ?? defaultAboutSeed);
      } catch (error) {
        console.error("Public about page data error", error);
        return defaultAboutSeed;
      }
    },
    defaultAboutSeed,
  );

  const mentors = await safeFetch<PublicMentor[]>(
    "mentors",
    async () => {
      try {
        const records = await (await mentorsCol())
          .find({ isPublished: true })
          .sort({ order: 1 })
          .limit(3)
          .toArray();

        return records.map((mentor) => {
          const publicMentor = { ...mentor };
          Reflect.deleteProperty(publicMentor, "photoPublicId");
          return publicMentor;
        });
      } catch (error) {
        console.error("Public about page mentors fetch failed", error);
        return [];
      }
    },
    [],
  );

  const stories = await safeFetch<PublicSuccessStory[]>(
    "success stories",
    async () => {
      try {
        const records = await (await successStoriesCol())
          .find({ status: "approved" })
          .sort({ isFeatured: -1, order: 1, createdAt: -1 })
          .limit(2)
          .toArray();

        return records.map((story) => {
          const publicStory = { ...story };
          Reflect.deleteProperty(publicStory, "authorEmail");
          Reflect.deleteProperty(publicStory, "authorPhotoPublicId");
          Reflect.deleteProperty(publicStory, "reviewedBy");
          return publicStory;
        });
      } catch (error) {
        console.error("Public about page stories fetch failed", error);
        return [];
      }
    },
    [],
  );

  return (
    <main>
      <AboutHero about={about} />
      <AboutMission about={about} />
      <AboutApproach about={about} />
      <AboutWhy about={about} />
      <AboutFaculty mentors={mentors} />
      <AboutStories stories={stories} />
      <CtaBand />
    </main>
  );
}

async function safeFetch<T>(
  label: string,
  fetchData: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fetchData();
  } catch (error) {
    console.error(`Public about page ${label} fetch failed`, error);
    return fallback;
  }
}

function normalizeAbout(data: About | AboutShape): AboutShape {
  const source = data ?? defaultAboutSeed;

  return {
    heroKicker:
      typeof source.heroKicker === "string"
        ? source.heroKicker
        : defaultAboutSeed.heroKicker,
    heroTitle:
      typeof source.heroTitle === "string"
        ? source.heroTitle
        : defaultAboutSeed.heroTitle,
    heroSubtitle:
      typeof source.heroSubtitle === "string"
        ? source.heroSubtitle
        : defaultAboutSeed.heroSubtitle,
    missionKicker:
      typeof source.missionKicker === "string"
        ? source.missionKicker
        : defaultAboutSeed.missionKicker,
    missionTitle:
      typeof source.missionTitle === "string"
        ? source.missionTitle
        : defaultAboutSeed.missionTitle,
    missionParagraphs: Array.isArray(source.missionParagraphs)
      ? source.missionParagraphs.filter((paragraph) => typeof paragraph === "string")
      : defaultAboutSeed.missionParagraphs,
    approachKicker:
      typeof source.approachKicker === "string"
        ? source.approachKicker
        : defaultAboutSeed.approachKicker,
    approachTitle:
      typeof source.approachTitle === "string"
        ? source.approachTitle
        : defaultAboutSeed.approachTitle,
    approachPillars: Array.isArray(source.approachPillars)
      ? source.approachPillars
          .filter((pillar) => pillar && typeof pillar.title === "string")
          .map((pillar) => ({
            title: typeof pillar.title === "string" ? pillar.title : "",
            description:
              typeof pillar.description === "string"
                ? pillar.description
                : "",
            iconName:
              typeof pillar.iconName === "string"
                ? pillar.iconName
                : "book-open",
          }))
      : defaultAboutSeed.approachPillars,
    whyKicker:
      typeof source.whyKicker === "string"
        ? source.whyKicker
        : defaultAboutSeed.whyKicker,
    whyTitle:
      typeof source.whyTitle === "string"
        ? source.whyTitle
        : defaultAboutSeed.whyTitle,
    whyComparisonRows: Array.isArray(source.whyComparisonRows)
      ? source.whyComparisonRows
          .filter((row) => row && typeof row.scattered === "string")
          .map((row) => ({
            scattered:
              typeof row.scattered === "string" ? row.scattered : "",
            bjsPrep: typeof row.bjsPrep === "string" ? row.bjsPrep : "",
          }))
      : defaultAboutSeed.whyComparisonRows,
    facultyKicker:
      typeof source.facultyKicker === "string"
        ? source.facultyKicker
        : defaultAboutSeed.facultyKicker,
    facultyTitle:
      typeof source.facultyTitle === "string"
        ? source.facultyTitle
        : defaultAboutSeed.facultyTitle,
    stats: Array.isArray(source.stats)
      ? source.stats.filter((stat) => stat && typeof stat.label === "string")
          .map((stat) => ({
            label: typeof stat.label === "string" ? stat.label : "",
            value: typeof stat.value === "string" ? stat.value : "",
          }))
      : defaultAboutSeed.stats,
  };
}
