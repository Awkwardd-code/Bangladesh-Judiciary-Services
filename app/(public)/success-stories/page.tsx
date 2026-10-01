import type { Metadata } from "next";
import { Filter } from "mongodb";

import { PublicSuccessStoriesFilter } from "@/components/public/success-stories-filter";
import { QueryPagination } from "@/components/public/query-pagination";
import { ShareYourStory } from "@/components/sections/share-your-story";
import { SuccessStoriesGrid } from "@/components/sections/success-stories-grid";
import { SuccessStoriesHero } from "@/components/sections/success-stories-hero";
import { successStoriesCol } from "@/lib/collections";
import type {
  PublicSuccessStory,
  SuccessStory,
} from "@/lib/types/success-story";

export const metadata: Metadata = {
  title: "Success Stories — BJS Prep",
  description:
    "Read how BJS Prep students prepared for and cleared the Bangladesh Judicial Service exam.",
};

export const revalidate = 60;

function toPublicStory(story: SuccessStory): PublicSuccessStory {
  const publicStory = { ...story };
  Reflect.deleteProperty(publicStory, "authorEmail");
  Reflect.deleteProperty(publicStory, "authorPhotoPublicId");
  Reflect.deleteProperty(publicStory, "reviewedBy");
  return publicStory;
}

export default async function SuccessStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    featured?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const featured = params.featured === "true";
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const limit = 9;
  let stories: PublicSuccessStory[] = [];
  let total = 0;

  try {
    const filter: Filter<SuccessStory> = { status: "approved" };
    if (featured) filter.isFeatured = true;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const expression = new RegExp(escaped, "i");
      filter.$or = [
        { authorName: expression },
        { authorUniversity: expression },
        { achievement: expression },
        { quote: expression },
      ];
    }

    const collection = await successStoriesCol();
    const [records, count] = await Promise.all([
      collection
      .find(filter)
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
      collection.countDocuments(filter),
    ]);
    stories = records.map(toPublicStory);
    total = count;
  } catch (error) {
    console.error("Success stories page data error", error);
  }

  return (
    <main>
      <SuccessStoriesHero stories={stories} />
      <PublicSuccessStoriesFilter />
      <SuccessStoriesGrid stories={stories} />
      <QueryPagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / limit))}
        total={total}
        limit={limit}
      />
      <ShareYourStory />
    </main>
  );
}
