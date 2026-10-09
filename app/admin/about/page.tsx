import type { Metadata } from "next";

import { AboutEditor } from "@/components/admin/about-editor";
import { aboutsCol } from "@/lib/collections";
import { defaultAboutSeed } from "@/lib/seed/about-default";
import type { About, AboutShape } from "@/lib/types/about";

export const metadata: Metadata = {
  title: "About — Admin — BJS Prep",
};

export const dynamic = "force-dynamic";

function serializeAbout(about: About): AboutShape {
  return {
    heroKicker: about.heroKicker,
    heroTitle: about.heroTitle,
    heroSubtitle: about.heroSubtitle,
    missionKicker: about.missionKicker,
    missionTitle: about.missionTitle,
    missionParagraphs: about.missionParagraphs,
    approachKicker: about.approachKicker,
    approachTitle: about.approachTitle,
    approachPillars: about.approachPillars,
    whyKicker: about.whyKicker,
    whyTitle: about.whyTitle,
    whyComparisonRows: about.whyComparisonRows,
    facultyKicker: about.facultyKicker,
    facultyTitle: about.facultyTitle,
    stats: about.stats,
  };
}

export default async function AdminAboutPage() {
  const about = await (await aboutsCol()).findOne({});

  return (
    <AboutEditor
      initialAbout={about ? serializeAbout(about) : null}
      defaults={defaultAboutSeed}
    />
  );
}
