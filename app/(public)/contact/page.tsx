import type { Metadata } from "next";

import { ContactHero } from "@/components/sections/contact-hero";
import { ContactGrid } from "@/components/sections/contact-grid";
import { ContactFaq } from "@/components/sections/contact-faq";

export const metadata: Metadata = {
  title: "Contact — BJS Prep",
  description: "Get in touch with the BJS Prep team.",
};

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactGrid />
      <ContactFaq />
    </main>
  );
}
