import type { Metadata } from "next";
import type { Filter } from "mongodb";

import { PublicMentorsFilter } from "@/components/public/mentors-filter";
import { QueryPagination } from "@/components/public/query-pagination";
import { MentorsGrid } from "@/components/sections/mentors-grid";
import { MentorsHero } from "@/components/sections/mentors-hero";
import { mentorsCol } from "@/lib/collections";
import type { Mentor } from "@/lib/types/mentor";
import type { PublicMentor } from "@/lib/types/mentor";

export const metadata: Metadata = {
  title: "Mentors — BJS Prep",
  description: "Meet the faculty guiding BJS Prep students.",
};

export const revalidate = 60;

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    specialization?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const specialization = params.specialization;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const limit = 9;
  let mentors: PublicMentor[] = [];
  let total = 0;

  try {
    const filter: Filter<Mentor> = { isPublished: true };
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const expression = new RegExp(escaped, "i");
      filter.$or = [
        { name: expression },
        { title: expression },
        { bio: expression },
      ];
    }
    if (specialization && specialization !== "all") {
      filter.specializations = specialization;
    }

    const collection = await mentorsCol();
    const [records, count] = await Promise.all([
      collection
        .find(filter)
        .sort({ order: 1, createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    mentors = records.map((mentor) => {
      const publicMentor = { ...mentor };
      Reflect.deleteProperty(publicMentor, "photoPublicId");
      return publicMentor;
    });
    total = count;
  } catch (error) {
    console.error("Public mentors page data error", error);
  }

  return (
    <main>
      <MentorsHero />
      <PublicMentorsFilter />
      <MentorsGrid mentors={mentors} />
      <QueryPagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / limit))}
        total={total}
        limit={limit}
      />
    </main>
  );
}