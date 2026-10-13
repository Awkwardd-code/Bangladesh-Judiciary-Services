"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { SegmentEditor } from "@/components/admin/segment-editor";
import {
  makeEmptySegment,
  reindexOrders,
} from "@/components/admin/course-content-helpers";
import { Button } from "@/components/ui/button";
import type { SerializedSegment } from "@/lib/types/course";

export function CourseContentEditor({
  courseSlug,
  courseId,
  segments,
  exams = [],
  isExamCourse = false,
  onChange,
}: {
  courseSlug: string;
  courseId?: string;
  segments: SerializedSegment[];
  exams?: Array<{
    id: string;
    title: string;
    kind?: string;
    segmentId?: string;
    subSegmentId?: string;
    status?: "draft" | "published" | "archived";
  }>;
  isExamCourse?: boolean;
  onChange: (segments: SerializedSegment[]) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(segments.map((segment) => segment._id))
  );

  useEffect(() => {
    setExpandedIds((current) => {
      const next = new Set(current);
      for (const segment of segments) {
        if (!next.has(segment._id)) {
          next.add(segment._id);
        }
      }
      return next;
    });
  }, [segments]);

  function updateSegment(id: string, patch: Partial<SerializedSegment>) {
    onChange(
      segments.map((segment) =>
        segment._id === id ? { ...segment, ...patch } : segment
      )
    );
  }

  function deleteSegment(id: string) {
    onChange(reindexOrders(segments.filter((segment) => segment._id !== id)));
  }

  function moveSegment(id: string, direction: -1 | 1) {
    const currentIndex = segments.findIndex((segment) => segment._id === id);
    if (currentIndex < 0) return;

    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= segments.length) return;

    const reordered = [...segments];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, moved);

    onChange(reindexOrders(reordered));
  }

  function addSegment() {
    const next = makeEmptySegment(segments.length);
    if (isExamCourse) {
      next.title = `Segment ${segments.length + 1}`;
    }
    const merged = [...segments, next];
    onChange(reindexOrders(merged));
    setExpandedIds((current) => new Set(current).add(next._id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold text-primary">
            {isExamCourse ? "Exam Structure" : "Course content"}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {segments.length}{" "}
            {isExamCourse
              ? segments.length === 1
                ? "segment"
                : "segments"
              : segments.length === 1
                ? "module"
                : "modules"}
          </p>
        </div>

        <Button type="button" onClick={addSegment}>
          <Plus className="h-4 w-4" />
          {isExamCourse ? "Add Segment" : "Add Module"}
        </Button>
      </div>

      {segments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted">
          {isExamCourse
            ? "No exam segments yet. Add a segment to get started."
            : "No course content yet. Add a module to get started."}
        </div>
      ) : (
        <div className="space-y-3">
          {segments.map((segment, index) => (
            <SegmentEditor
              key={segment._id}
              segment={segment}
              index={index}
              courseSlug={courseSlug}
              courseId={courseId}
              isExamCourse={isExamCourse}
              availableExams={exams}
              canMoveUp={index > 0}
              canMoveDown={index < segments.length - 1}
              expanded={expandedIds.has(segment._id)}
              onToggleExpand={() => {
                setExpandedIds((current) => {
                  const next = new Set(current);
                  if (next.has(segment._id)) {
                    next.delete(segment._id);
                  } else {
                    next.add(segment._id);
                  }
                  return next;
                });
              }}
              onChange={(next) => updateSegment(segment._id, next)}
              onMoveUp={() => moveSegment(segment._id, -1)}
              onMoveDown={() => moveSegment(segment._id, 1)}
              onDelete={() => deleteSegment(segment._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
