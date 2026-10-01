import { ObjectId } from "mongodb";

import type { About, AboutShape } from "@/lib/types/about";

export const defaultAboutSeed: AboutShape = {
  heroKicker: "Why BJS Prep",
  heroTitle: "A smarter roadmap for Bangladesh Judicial Service aspirants.",
  heroSubtitle:
    "We combine structured guidance, realistic practice, and mentor-driven accountability so students can prepare with clarity instead of guesswork.",
  missionKicker: "Our mission",
  missionTitle: "To make high-quality judicial prep accessible, practical, and disciplined.",
  missionParagraphs: [
    "BJS Prep was built to address the real pain points students face while preparing for the Bangladesh Judicial Service examination: fragmented resources, inconsistent guidance, and low-quality mock practice.",
    "We combine focused curriculum design, case-oriented learning, and realistic exam simulation to help aspirants study efficiently and with stronger confidence.",
  ],
  approachKicker: "How we work",
  approachTitle: "We turn preparation into a measurable process.",
  approachPillars: [
    {
      title: "Structured learning",
      description:
        "Every topic is mapped to a disciplined preparation flow so students know what to cover, in what order, and why it matters.",
      iconName: "book-open",
    },
    {
      title: "Practice with feedback",
      description:
        "We combine model tests, revision cycles, and guided reviews to improve performance from the first attempt onward.",
      iconName: "chart-bar",
    },
    {
      title: "Mentor accountability",
      description:
        "Aspirants stay on track with regular guidance, encouragement, and practical feedback from experienced mentors.",
      iconName: "users",
    },
  ],
  whyKicker: "Why students choose us",
  whyTitle: "A preparation model built for consistency and outcomes.",
  whyComparisonRows: [
    {
      scattered: "Random resources and unstructured study",
      bjsPrep: "Clear strategy, guided learning, and timed mock practice",
    },
    {
      scattered: "No accountability or feedback loop",
      bjsPrep: "Mentor guidance and performance review",
    },
    {
      scattered: "Guesswork during revision",
      bjsPrep: "Focused review built around exam readiness",
    },
  ],
  facultyKicker: "Our team",
  facultyTitle: "A faculty approach shaped by real exam experience.",
  stats: [
    { label: "Mentors", value: "5+" },
    { label: "Success stories", value: "150+" },
    { label: "Practice tests", value: "20+" },
  ],
};

export function buildDefaultAboutSeed(updatedBy?: ObjectId): About {
  const authorId = updatedBy ?? new ObjectId();

  return {
    _id: new ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    updatedBy: authorId,
    ...defaultAboutSeed,
  };
}
