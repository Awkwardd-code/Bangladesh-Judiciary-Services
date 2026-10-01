import type { Metadata } from "next";

import { NoticesHero } from "@/components/sections/notices-hero";
import { NoticesList } from "@/components/sections/notices-list";

export const metadata: Metadata = {
  title: "Notices — BJS Prep",
  description: "Latest announcements and updates from BJS Prep.",
};

export default function NoticesPage() {
  return (
    <>
      <NoticesHero />
      <NoticesList />
    </>
  );
}
