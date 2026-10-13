"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export type ExamCreateCourse = {
  id: string;
  title: string;
  category?: string;
  programKind?: "course" | "exam";
  segments?: Array<{
    id: string;
    title: string;
    subSegments?: Array<{ id: string; title: string }>;
  }>;
};

export function ExamCreatePicker({ courses }: { courses: ExamCreateCourse[] }) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [selectedSubSegmentId, setSelectedSubSegmentId] = useState("");

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId]
  );

  const segments = selectedCourse?.segments ?? [];
  const selectedSegment =
    segments.find((segment) => segment.id === selectedSegmentId) ?? null;
  const subSegments = selectedSegment?.subSegments ?? [];

  const canContinue =
    Boolean(selectedCourseId) &&
    Boolean(selectedSegmentId) &&
    Boolean(selectedSubSegmentId);

  function handleContinue() {
    if (!canContinue) {
      return;
    }

    const params = new URLSearchParams({
      courseId: selectedCourseId,
      segmentId: selectedSegmentId,
      subSegmentId: selectedSubSegmentId,
    });

    router.push(`/admin/exams/new?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Create exam
            </p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-primary">
              Choose a course or exam course
            </h1>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Course</label>
            <Select
              value={selectedCourseId}
              onChange={(event) => {
                setSelectedCourseId(event.target.value);
                setSelectedSegmentId("");
                setSelectedSubSegmentId("");
              }}
              className="w-full"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                  {course.programKind === "exam" ? " · Exam Course" : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Segment</label>
            <Select
              value={selectedSegmentId}
              onChange={(event) => {
                setSelectedSegmentId(event.target.value);
                setSelectedSubSegmentId("");
              }}
              disabled={!selectedCourse || segments.length === 0}
              className="w-full"
            >
              <option value="">Select a segment</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.title}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
              Sub-segment
            </label>
            <Select
              value={selectedSubSegmentId}
              onChange={(event) => setSelectedSubSegmentId(event.target.value)}
              disabled={!selectedSegment || subSegments.length === 0}
              className="w-full"
            >
              <option value="">Select a sub-segment</option>
              {subSegments.map((subSegment) => (
                <option key={subSegment.id} value={subSegment.id}>
                  {subSegment.title}
                </option>
              ))}
            </Select>
          </div>

          <Button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
