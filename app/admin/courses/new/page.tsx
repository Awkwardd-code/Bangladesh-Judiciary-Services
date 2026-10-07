import { requireAdmin } from "@/lib/auth-guard";
import { mentorsCol } from "@/lib/collections";
import { CourseEditor } from "@/components/admin/course-editor";

export default async function NewCoursePage() {
  const session = await requireAdmin();

  if (!session) {
    return null;
  }

  const mentors = await (await mentorsCol())
    .find({ isPublished: true })
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <CourseEditor
      course={null}
      mentors={mentors.map((mentor) => ({
        id: mentor._id.toString(),
        name: mentor.name,
        title: mentor.title,
        photoUrl: mentor.photoUrl ?? null,
      }))}
    />
  );
}
