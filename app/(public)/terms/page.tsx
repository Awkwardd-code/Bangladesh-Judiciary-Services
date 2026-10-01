import type { Metadata } from "next";

import { LegalContent } from "@/components/sections/legal-content";
import { LegalHero } from "@/components/sections/legal-hero";
import { termsSections } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Terms of Service — BJS Prep",
  description: "Terms of service for using the BJS Prep platform.",
};

export default function TermsPage() {
  return (
    <>
      <LegalHero
        title="Terms of Service"
        kicker="Legal"
        updated="27 September 2026"
      />
      <LegalContent sections={termsSections} />
    </>
  );
}
