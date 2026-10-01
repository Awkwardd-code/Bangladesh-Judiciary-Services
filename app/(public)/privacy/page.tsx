import type { Metadata } from "next";

import { LegalContent } from "@/components/sections/legal-content";
import { LegalHero } from "@/components/sections/legal-hero";
import { privacySections } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Privacy Policy — BJS Prep",
  description: "How BJS Prep collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <LegalHero
        title="Privacy Policy"
        kicker="Legal"
        updated="27 September 2026"
      />
      <LegalContent sections={privacySections} />
    </>
  );
}
