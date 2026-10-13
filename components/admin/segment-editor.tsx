"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderOpen,
  Lock,
  Pencil,
  PlayCircle,
  Plus,
  Radio,
  Trash2,
  Unlock,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ExamAttachDialog } from "@/components/admin/exam-attach-dialog";
import { SubSegmentDialog } from "@/components/admin/sub-segment-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  makeEmptySubSegment,
  reindexOrders,
} from "@/components/admin/course-content-helpers";
import type {
  SerializedSegment,
  SerializedSubSegment,
  SubSegmentKind,
} from "@/lib/types/course";

const kindIcons = {
  lecture: PlayCircle,
  video: Video,
  live: Radio,
  note: FileText,
  material: BookOpen,
} as const;

export function SegmentEditor({
  segment,
  index,
  courseSlug,
  courseId,
  isExamCourse = false,
  availableExams = [],
  canMoveUp,
  canMoveDown,
  expanded,
  onToggleExpand,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  segment: SerializedSegment;
  index: number;
  courseSlug: string;
  courseId?: string;
  isExamCourse?: boolean;
  availableExams?: Array<{
    id: string;
    title: string;
    kind?: string;
    segmentId?: string;
    subSegmentId?: string;
    status?: "draft" | "published" | "archived";
  }>;
  canMoveUp: boolean;
  canMoveDown: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onChange: (next: SerializedSegment) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [examPickerOpen, setExamPickerOpen] = useState(false);
  const editingSubSegment = useMemo(
    () => segment.subSegments.find((item) => item._id === editingId) ?? null,
    [editingId, segment.subSegments]
  );

  const attachedExams = useMemo(
    () =>
      (segment.examIds ?? [])
        .map((examId) => availableExams.find((exam) => exam.id === examId))
        .filter((exam): exam is { id: string; title: string; kind?: string } =>
          Boolean(exam)
        ),
    [availableExams, segment.examIds]
  );

  function updateSubSegment(id: string, patch: Partial<SerializedSubSegment>) {
    onChange({
      ...segment,
      subSegments: segment.subSegments.map((item) =>
        item._id === id ? { ...item, ...patch } : item
      ),
    });
  }

  function addSubSegment(kind: SubSegmentKind) {
    const next = makeEmptySubSegment(segment.subSegments.length, kind);
    if (isExamCourse) {
      next.title = `Sub-segment ${segment.subSegments.length + 1}`;
    }
    const merged = [...segment.subSegments, next];
    onChange({
      ...segment,
      subSegments: reindexOrders(merged),
    });
    setEditingId(next._id);
  }

  function deleteSubSegment(subId: string) {
    onChange({
      ...segment,
      subSegments: reindexOrders(
        segment.subSegments.filter((item) => item._id !== subId)
      ),
    });
  }

  function moveSubSegment(subId: string, direction: -1 | 1) {
    const currentIndex = segment.subSegments.findIndex(
      (item) => item._id === subId
    );
    if (currentIndex < 0) return;

    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= segment.subSegments.length) return;

    const reordered = [...segment.subSegments];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, moved);

    onChange({
      ...segment,
      subSegments: reindexOrders(reordered),
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm lg:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <FolderOpen className="mt-8 h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`segment-title-${segment._id}`}
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              {isExamCourse ? `Segment ${index + 1} name` : `Module ${index + 1} name`}
            </label>
            <Input
              id={`segment-title-${segment._id}`}
              value={segment.title}
              placeholder={isExamCourse ? "e.g. Preliminary tests" : "e.g. Constitutional law"}
              onChange={(event) =>
                onChange({
                  ...segment,
                  title: event.target.value,
                })
              }
              className="font-semibold"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 self-end sm:self-auto">
          <label className="mr-1 flex cursor-pointer items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <Checkbox
              checked={segment.isFree}
              onCheckedChange={(value) =>
                onChange({
                  ...segment,
                  isFree: Boolean(value),
                })
              }
              className="h-3.5 w-3.5"
            />
            {isExamCourse ? "Free segment" : "Free module"}
          </label>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Move ${isExamCourse ? "segment" : "module"} ${index + 1} up`}
          >
            <ChevronUp className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Move ${isExamCourse ? "segment" : "module"} ${index + 1} down`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted"
            aria-label={
              expanded
                ? `Collapse ${isExamCourse ? "segment" : "module"}`
                : `Expand ${isExamCourse ? "segment" : "module"}`
            }
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-red-600 hover:bg-red-50"
            aria-label={`Delete ${isExamCourse ? "segment" : "module"} ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor={`segment-description-${segment._id}`}
          className="mb-2 block text-xs font-medium text-primary"
        >
          {isExamCourse ? "Segment details" : "Module description"}
        </label>
        <Textarea
          id={`segment-description-${segment._id}`}
          rows={2}
          value={segment.description}
          placeholder={
            isExamCourse
              ? "Describe the tests or preparation in this segment."
              : "Summarize what students will learn in this module."
          }
          onChange={(event) =>
            onChange({
              ...segment,
              description: event.target.value,
            })
          }
          className="min-h-20"
        />
      </div>

      {!segment.isFree ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-muted">
            {isExamCourse ? "Segment price (BDT)" : "Module price (BDT)"}
            <Input
              type="number"
              aria-label={`${isExamCourse ? "Segment" : "Module"} ${index + 1} price in BDT`}
              min={0}
              value={segment.price ?? 0}
              onChange={(event) =>
                onChange({
                  ...segment,
                  price: Math.max(0, Number(event.target.value)),
                })
              }
              className="mt-1"
            />
          </label>
          <label className="text-xs font-medium text-muted">
            Discounted price (BDT, optional)
            <Input
              type="number"
              aria-label={`${isExamCourse ? "Segment" : "Module"} ${index + 1} discounted price in BDT`}
              min={0}
              max={segment.price ?? 0}
              value={segment.discountedPrice ?? ""}
              onChange={(event) =>
                onChange({
                  ...segment,
                  discountedPrice:
                    event.target.value === ""
                      ? undefined
                      : Math.max(0, Number(event.target.value)),
                })
              }
              className="mt-1"
            />
          </label>
        </div>
      ) : null}

      {expanded ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {attachedExams.length > 0 ? (
                attachedExams.map((exam) => (
                  <Badge
                    key={exam.id}
                    className="border-blue-200 bg-blue-50 text-blue-700"
                  >
                    {exam.title}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted">No exams attached</span>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={() => setExamPickerOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Exam
            </Button>
          </div>

          {segment.subSegments.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted">
              No content yet.
            </div>
          ) : null}

          {segment.subSegments.map((subSegment) => {
            const Icon = kindIcons[subSegment.kind] ?? FileText;
            const isLocked = !subSegment.isFree;
            const subSegmentExams = availableExams.filter(
              (exam) =>
                exam.segmentId === segment._id &&
                exam.subSegmentId === subSegment._id
            );

            return (
              <div
                key={subSegment._id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Icon className="h-4 w-4 text-blue-600" />
                  <Input
                    aria-label={`${isExamCourse ? "Sub-segment" : "Lesson"} title`}
                    placeholder={
                      isExamCourse
                        ? "Sub-segment title"
                        : "Lesson or content title"
                    }
                    value={subSegment.title}
                    onChange={(event) =>
                      updateSubSegment(subSegment._id, {
                        title: event.target.value,
                      })
                    }
                    className="flex-1 border-0 bg-transparent px-0 text-sm font-medium text-primary shadow-none focus-visible:ring-0"
                  />

                  {isExamCourse ? (
                    <span className="text-xs text-muted">Sub-segment</span>
                  ) : (
                    <Select
                      value={subSegment.kind}
                      aria-label="Content type"
                      onChange={(event) =>
                        updateSubSegment(subSegment._id, {
                          kind: event.target.value as SubSegmentKind,
                          payload: {},
                        })
                      }
                      className="w-36"
                    >
                      <option value="lecture">Class Lecture</option>
                      <option value="video">Video</option>
                      <option value="live">Live</option>
                      <option value="note">Class Note</option>
                    </Select>
                  )}

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-primary">
                    <Checkbox
                      checked={subSegment.isFree}
                      onCheckedChange={(value) =>
                        updateSubSegment(subSegment._id, {
                          isFree: Boolean(value),
                        })
                      }
                      className="h-4 w-4"
                    />
                    Free preview
                  </label>

                  <button
                    type="button"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted"
                    onClick={() => moveSubSegment(subSegment._id, -1)}
                    aria-label="Move sub-segment up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted"
                    onClick={() => moveSubSegment(subSegment._id, 1)}
                    aria-label="Move sub-segment down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5"
                    onClick={() => setEditingId(subSegment._id)}
                    aria-label="Edit content item"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                    onClick={() => deleteSubSegment(subSegment._id)}
                    aria-label="Delete content item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div>
                    {subSegment.isFree ? (
                      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        Free
                      </Badge>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    )}
                  </div>
                  {isLocked ? (
                    <Lock className="h-4 w-4 text-red-600" />
                  ) : (
                    <Unlock className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                {isExamCourse ? (
                  <div className="mt-3 border-t border-border pt-3">
                    {subSegmentExams.length ? (
                      <ul className="space-y-2">
                        {subSegmentExams.map((exam) => (
                          <li
                            key={exam.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Badge className="border-accent/30 bg-accent/5 text-accent">
                              {exam.kind === "preliminary"
                                ? "Preliminary"
                                : "Written"}
                            </Badge>
                            <span className="text-primary">{exam.title}</span>
                            {exam.status !== "published" ? (
                              <span className="text-xs text-muted">
                                ({exam.status ?? "draft"})
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted">
                        No Preliminary or Written tests in this sub-segment yet.
                      </p>
                    )}
                    {courseId ? (
                      <Link
                        href={`/admin/exams/new?${new URLSearchParams({
                          courseId,
                          segmentId: segment._id,
                          subSegmentId: subSegment._id,
                        }).toString()}`}
                        className="mt-3 inline-flex h-9 items-center rounded-md border border-border px-3 text-xs font-medium text-primary hover:bg-primary/5"
                      >
                        Add Preliminary/Written test
                      </Link>
                    ) : (
                      <p className="mt-3 text-xs text-muted">
                        Save the exam course first to create tests.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}

          {isExamCourse ? (
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={() => addSubSegment("note")}
            >
              <Plus className="h-4 w-4" />
              Add Sub-segment
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={() => addSubSegment("lecture")}
              >
                <Plus className="h-4 w-4" />
                Add Class Lecture
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={() => addSubSegment("video")}
              >
                <Plus className="h-4 w-4" />
                Add Video
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={() => addSubSegment("live")}
              >
                <Plus className="h-4 w-4" />
                Add Live
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={() => addSubSegment("note")}
              >
                <Plus className="h-4 w-4" />
                Add Class Note
              </Button>
            </div>
          )}
        </div>
      ) : null}

      <ExamAttachDialog
        open={examPickerOpen}
        availableExams={availableExams}
        selectedIds={segment.examIds ?? []}
        onSave={(nextIds) =>
          onChange({
            ...segment,
            examIds: nextIds,
          })
        }
        onClose={() => setExamPickerOpen(false)}
      />

      <SubSegmentDialog
        open={Boolean(editingId)}
        courseSlug={courseSlug}
        subSegment={editingSubSegment}
        onSave={(next) => {
          onChange({
            ...segment,
            subSegments: segment.subSegments.map((item) =>
              item._id === next._id ? next : item
            ),
          });
          setEditingId(null);
        }}
        onClose={() => setEditingId(null)}
      />
    </div>
  );
}
