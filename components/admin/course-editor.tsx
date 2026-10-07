"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CourseMaterialsTab } from "@/components/admin/course-materials-tab";
import type { EditableMaterial } from "@/components/admin/material-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type SerializedCourse = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  longDescription?: string;
  category?: "preliminary" | "written" | "viva" | "foundation";
  level?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  price?: number;
  discountPercent?: number;
  durationWeeks?: number;
  durationLabel?: string;
  totalClasses?: number;
  totalMockTests?: number;
  totalMaterials?: number;
  features?: Array<{ label: string; value: string; iconName: string }>;
  modules?: Array<{
    title: string;
    description: string;
    order: number;
    estimatedHours: number;
  }>;
  mentorIds?: string[];
  isPublished?: boolean;
  status?: "draft" | "published" | "archived";
  order?: number;
};

type SerializedMentor = {
  id: string;
  name: string;
  title?: string;
  photoUrl?: string | null;
};

export function CourseEditor({
  course,
  mentors,
  initialMaterials = [],
}: {
  course: SerializedCourse | null;
  mentors: SerializedMentor[];
  initialMaterials?: EditableMaterial[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<SerializedCourse>({
    title: course?.title ?? "",
    slug: course?.slug ?? "",
    description: course?.description ?? "",
    longDescription: course?.longDescription ?? "",
    category: course?.category ?? "preliminary",
    level: course?.level ?? "intermediate",
    tags: course?.tags ?? [],
    price: course?.price ?? 0,
    discountPercent: course?.discountPercent ?? 0,
    durationWeeks: course?.durationWeeks ?? 8,
    durationLabel: course?.durationLabel ?? "8 weeks",
    totalClasses: course?.totalClasses ?? 0,
    totalMockTests: course?.totalMockTests ?? 0,
    totalMaterials: course?.totalMaterials ?? 0,
    features: course?.features ?? [],
    modules: course?.modules ?? [],
    mentorIds: course?.mentorIds ?? [],
    isPublished: course?.isPublished ?? false,
    status: course?.status ?? "draft",
    order: course?.order ?? 0,
  });
  const saveCourse = async () => {
    const url = course?.id ? `/api/admin/courses/${course.id}` : "/api/admin/courses";
    const method = course?.id ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error ?? "Unable to save course.");
    }

    const next = payload?.data?.course;

    if (next?.id) {
      router.push(`/admin/courses/${next.id}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-muted">Title</label>
                <Input
                  value={form.title ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted">Slug</label>
                <Input
                  value={form.slug ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">Description</label>
              <Textarea
                rows={3}
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">
                Long description
              </label>
              <Textarea
                rows={8}
                value={form.longDescription ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    longDescription: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-muted">Category</label>
                <select
                  value={form.category ?? "preliminary"}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      category: event.target.value as SerializedCourse["category"],
                    }))
                  }
                  className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
                >
                  <option value="preliminary">Preliminary</option>
                  <option value="written">Written</option>
                  <option value="viva">Viva</option>
                  <option value="foundation">Foundation</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted">Level</label>
                <select
                  value={form.level ?? "intermediate"}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      level: event.target.value as SerializedCourse["level"],
                    }))
                  }
                  className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted">Status</label>
                <select
                  value={form.status ?? "draft"}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value as SerializedCourse["status"],
                    }))
                  }
                  className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                checked={Boolean(form.isPublished)}
                onCheckedChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    isPublished: Boolean(value),
                  }))
                }
              />
              <span className="text-sm text-muted">Published</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="curriculum">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <label className="mb-2 block text-sm text-muted">Duration weeks</label>
                <Input
                  type="number"
                  value={form.durationWeeks ?? 0}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      durationWeeks: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Duration label</label>
                <Input
                  value={form.durationLabel ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      durationLabel: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Total classes</label>
                <Input
                  type="number"
                  value={form.totalClasses ?? 0}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      totalClasses: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Model tests</label>
                <Input
                  type="number"
                  value={form.totalMockTests ?? 0}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      totalMockTests: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Materials</label>
                <Input
                  type="number"
                  value={form.totalMaterials ?? 0}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      totalMaterials: Number(event.target.value),
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mentors">
          <div className="space-y-4">
            {mentors.map((mentor) => {
              const selected = form.mentorIds?.includes(mentor.id);

              return (
                <button
                  key={mentor.id}
                  type="button"
                  onClick={() =>
                    setForm((prev) => {
                      const existing = prev.mentorIds ?? [];
                      const next = existing.includes(mentor.id)
                        ? existing.filter((item) => item !== mentor.id)
                        : [...existing, mentor.id];

                      return {
                        ...prev,
                        mentorIds: next,
                      };
                    })
                  }
                  className={
                    selected
                      ? "flex w-full cursor-pointer items-center justify-between rounded-md border border-primary bg-primary/5 p-3 text-left"
                      : "flex w-full cursor-pointer items-center justify-between rounded-md border border-border bg-card p-3 text-left"
                  }
                >
                  <div>
                    <div className="font-medium text-primary">{mentor.name}</div>
                    <div className="text-sm text-muted">{mentor.title}</div>
                  </div>
                  <span className="text-xs text-muted">
                    {selected ? "Selected" : "Select"}
                  </span>
                </button>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="materials">
          {course?.id ? (
            <CourseMaterialsTab
              courseId={course.id}
              initialMaterials={initialMaterials}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted">
              Save the course first to add materials.
            </div>
          )}
        </TabsContent>

        <TabsContent value="pricing">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-muted">Price</label>
              <Input
                type="number"
                value={form.price ?? 0}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    price: Number(event.target.value),
                  }))
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">Discount percent</label>
              <Input
                type="number"
                value={form.discountPercent ?? 0}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    discountPercent: Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-4 text-sm text-muted">
            Free courses skip payment and auto-enroll students.
          </div>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/courses")}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={() => {
            void saveCourse();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
