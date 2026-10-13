import type { Metadata } from "next";

import { NoticesHero } from "@/components/sections/notices-hero";
import { NoticesList } from "@/components/sections/notices-list";

export const metadata: Metadata = {
  title: "Notices — LegalPath Bangladesh",
  description: "Latest announcements and updates from LegalPath Bangladesh.",
};

export default function NoticesPage() {
  return (
    <>
      <NoticesHero />
      <NoticesList />
    </>
  );
}
