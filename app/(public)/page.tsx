import type { Metadata } from "next";

import {
  FeaturedCourses,
  type PublicCourse,
} from "@/components/sections/featured-courses";
import { Hero, type HomeStats } from "@/components/sections/hero";
import { HowToEnroll } from "@/components/sections/how-to-enroll";
import { MentorAndCta } from "@/components/sections/mentor-and-cta";
import { ModelTestsBand } from "@/components/sections/model-tests-band";
import { SuccessStoriesPreview } from "@/components/sections/success-stories-preview";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import {
  aboutsCol,
  coursesCol,
  mentorsCol,
  preliminaryAttemptsCol,
  preliminaryExamsCol,
  successStoriesCol,
  usersCol,
} from "@/lib/collections";
import type { About } from "@/lib/types/about";
import type { Course } from "@/lib/types/course";
import type { Mentor, PublicMentor } from "@/lib/types/mentor";
import type {
  PublicSuccessStory,
  SuccessStory,
} from "@/lib/types/success-story";

export const metadata: Metadata = {
  title: "BJS Prep — Bangladesh Judicial Service Exam Preparation",
  description:
    "From campus to court. Structured, mentor-led preparation for the Bangladesh Judicial Service exam.",
};

export const revalidate = 60;

export default async function Home() {
  const [courses, mentor, stories, about, students, mockExams, attempts] =
    await Promise.all([
      safeFetch<PublicCourse[]>(
        "featured courses",
        async () => {
          const records = await (
            await coursesCol()
          )
            .find({ isPublished: true })
            .sort({ order: 1, createdAt: -1 })
            .limit(3)
            .toArray();

          return records.map(toPublicCourse);
        },
        [],
      ),
      safeFetch<PublicMentor | null>(
        "featured mentor",
        async () => {
          const record = await (
            await mentorsCol()
          ).findOne({ isPublished: true }, { sort: { order: 1 } });
          return record ? toPublicMentor(record) : null;
        },
        null,
      ),
      safeFetch<PublicSuccessStory[]>(
        "featured success stories",
        async () => {
          const records = await (
            await successStoriesCol()
          )
            .find({ status: "approved" })
            .sort({ isFeatured: -1, order: 1, createdAt: -1 })
            .limit(3)
            .toArray();

          return records.map(toPublicStory);
        },
        [],
      ),
      safeFetch<About | null>(
        "about content",
        async () => (await aboutsCol()).findOne({}),
        null,
      ),
      safeFetch(
        "student count",
        async () => (await usersCol()).countDocuments(),
        0,
      ),
      safeFetch(
        "published mock exam count",
        async () =>
          (await preliminaryExamsCol()).countDocuments({ status: "published" }),
        0,
      ),
      safeFetch(
        "attempt count",
        async () => (await preliminaryAttemptsCol()).countDocuments(),
        0,
      ),
    ]);

  const stats: HomeStats = {
    students,
    mockExams,
    attempts,
  };

  return (
    <>
      <Hero stats={stats} about={about} />
      <WhyChooseUs />
      <FeaturedCourses courses={courses} />
      <ModelTestsBand stats={stats} />
      <HowToEnroll />
      <SuccessStoriesPreview stories={stories} />
      <MentorAndCta mentor={mentor} />
    </>
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
    console.error(`Homepage ${label} fetch failed`, error);
    return fallback;
  }
}

function toPublicCourse(course: Course): PublicCourse {
  return {
    _id: course._id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    coverUrl: course.coverUrl,
    category: course.category,
    price: course.price,
    durationLabel: course.durationLabel,
  };
}

function toPublicMentor(mentor: Mentor): PublicMentor {
  const publicMentor = { ...mentor };
  Reflect.deleteProperty(publicMentor, "photoPublicId");
  return publicMentor;
}

function toPublicStory(story: SuccessStory): PublicSuccessStory {
  const publicStory = { ...story };
  Reflect.deleteProperty(publicStory, "authorEmail");
  Reflect.deleteProperty(publicStory, "authorPhotoPublicId");
  Reflect.deleteProperty(publicStory, "reviewedBy");
  return publicStory;
}
