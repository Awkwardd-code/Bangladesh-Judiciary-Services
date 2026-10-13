"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ExamLevelDialog,
  type AvailableQuestion,
} from "@/components/admin/exam-level-dialog";
import type {
  SerializedExamLevel,
  SerializedExamSegment,
  SerializedExamSubSegment,
} from "@/lib/types/exam";
import {
  makeEmptyExamSegment,
  makeEmptyExamSubSegment,
  moveItem,
  reindexOrders,
} from "@/lib/exam-helpers";

export type ExamPlanEditorProps = {
  segments: SerializedExamSegment[];
  questions: AvailableQuestion[];
  onChange: (next: SerializedExamSegment[]) => void;
  onSave: () => void;
  saving: boolean;
};

type LevelDialogState = {
  segmentId: string;
  subId: string;
  levelId: string;
} | null;

export function ExamPlanEditor({
  segments,
  questions,
  onChange,
  onSave,
  saving,
}: ExamPlanEditorProps) {
  const [openSegmentId, setOpenSegmentId] = useState<string | null>(
    null,
  );
  const [levelDialog, setLevelDialog] =
    useState<LevelDialogState>(null);

  const updateSegment = (
    id: string,
    patch: Partial<SerializedExamSegment>,
  ) => {
    onChange(
      segments.map((s) => (s._id === id ? { ...s, ...patch } : s)),
    );
  };

  const removeSegment = (id: string) => {
    onChange(reindexOrders(segments.filter((s) => s._id !== id)));
  };

  const moveSegment = (id: string, dir: "up" | "down") => {
    const i = segments.findIndex((s) => s._id === id);
    if (i < 0) return;
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= segments.length) return;
    onChange(reindexOrders(moveItem(segments, i, j)));
  };

  const addSubSegment = (segmentId: string) => {
    const seg = segments.find((s) => s._id === segmentId);
    if (!seg) return;
    const next = makeEmptyExamSubSegment(seg.subSegments.length);
    updateSegment(segmentId, {
      subSegments: [...seg.subSegments, next],
    });
  };

  const updateSubSegment = (
    segmentId: string,
    subId: string,
    patch: Partial<SerializedExamSubSegment>,
  ) => {
    const seg = segments.find((s) => s._id === segmentId);
    if (!seg) return;
    updateSegment(segmentId, {
      subSegments: seg.subSegments.map((sub) =>
        sub._id === subId ? { ...sub, ...patch } : sub,
      ),
    });
  };

  const removeSubSegment = (segmentId: string, subId: string) => {
    const seg = segments.find((s) => s._id === segmentId);
    if (!seg) return;
    updateSegment(segmentId, {
      subSegments: reindexOrders(
        seg.subSegments.filter((sub) => sub._id !== subId),
      ),
    });
  };

  const moveSubSegment = (
    segmentId: string,
    subId: string,
    dir: "up" | "down",
  ) => {
    const seg = segments.find((s) => s._id === segmentId);
    if (!seg) return;
    const i = seg.subSegments.findIndex((s) => s._id === subId);
    if (i < 0) return;
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= seg.subSegments.length) return;
    updateSegment(segmentId, {
      subSegments: reindexOrders(
        moveItem(seg.subSegments, i, j),
      ),
    });
  };

  const updateLevel = (
    segmentId: string,
    subId: string,
    levelId: string,
    next: SerializedExamLevel,
  ) => {
    const seg = segments.find((s) => s._id === segmentId);
    if (!seg) return;
    const sub = seg.subSegments.find((s) => s._id === subId);
    if (!sub) return;
    updateSubSegment(segmentId, subId, {
      levels: sub.levels.map((l) =>
        l._id === levelId ? next : l,
      ),
    });
  };

  const stats = {
    months: segments.length,
    weeks: segments.reduce((n, s) => n + s.subSegments.length, 0),
    levels: segments.reduce(
      (n, s) =>
        n +
        s.subSegments.reduce((m, w) => m + w.levels.length, 0),
      0,
    ),
  };

  const currentLevel: SerializedExamLevel | null = levelDialog
    ? segments
        .find((s) => s._id === levelDialog.segmentId)
        ?.subSegments.find((w) => w._id === levelDialog.subId)
        ?.levels.find((l) => l._id === levelDialog.levelId) ?? null
    : null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold text-primary">
            Exam plan
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.months} months · {stats.weeks} weeks ·{" "}
            {stats.levels} levels
          </p>
        </div>
        <Button
          onClick={() =>
            onChange([
              ...segments,
              makeEmptyExamSegment(segments.length),
            ])
          }
        >
          <Plus size={16} className="mr-2" />
          Add Month
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {segments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <Calendar
              size={40}
              className="mx-auto text-muted-foreground"
            />
            <h3 className="mt-4 font-medium text-primary">
              No months yet.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the first month to start building the exam plan.
            </p>
            <Button
              className="mt-6"
              onClick={() =>
                onChange([makeEmptyExamSegment(0)])
              }
            >
              Add first month
            </Button>
          </div>
        ) : (
          segments.map((segment, i) => {
            const isOpen = openSegmentId === segment._id;
            return (
              <div
                key={segment._id}
                className="rounded-lg border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-gold" />
                  <Input
                    value={segment.title}
                    onChange={(e) =>
                      updateSegment(segment._id, {
                        title: e.target.value,
                      })
                    }
                    className="h-9 flex-1"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-foreground">
                    <Checkbox
                      checked={segment.isFree}
                      onCheckedChange={(v) =>
                        updateSegment(segment._id, {
                          isFree: v === true,
                        })
                      }
                    />
                    Free
                  </label>
                  {!segment.isFree ? (
                    <>
                      <Input
                        type="number"
                        value={segment.price}
                        onChange={(e) =>
                          updateSegment(segment._id, {
                            price: Number(e.target.value),
                          })
                        }
                        placeholder="Price"
                        className="h-9 w-24"
                      />
                      <Input
                        type="number"
                        value={segment.discountedPrice ?? ""}
                        onChange={(e) =>
                          updateSegment(segment._id, {
                            discountedPrice:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        placeholder="Discount"
                        className="h-9 w-24"
                      />
                    </>
                  ) : null}
                  <Button
                    variant="ghost"
                    className="h-9 w-9 p-0"
                    onClick={() => moveSegment(segment._id, "up")}
                    disabled={i === 0}
                  >
                    <ChevronUp size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 w-9 p-0"
                    onClick={() => moveSegment(segment._id, "down")}
                    disabled={i === segments.length - 1}
                  >
                    <ChevronDown size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 w-9 p-0"
                    onClick={() =>
                      setOpenSegmentId(
                        isOpen ? null : segment._id,
                      )
                    }
                  >
                    <ChevronRight
                      size={16}
                      className={
                        isOpen ? "rotate-90 transition-transform" : ""
                      }
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 w-9 p-0 text-red-600"
                    onClick={() => removeSegment(segment._id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <Textarea
                  value={segment.description}
                  onChange={(e) =>
                    updateSegment(segment._id, {
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className="mt-2"
                />

                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {segment.subSegments.length} weeks
                  </span>
                  {segment.isFree ? (
                    <Badge className="border border-emerald-300 bg-emerald-50 text-emerald-700">
                      Free
                    </Badge>
                  ) : (
                    <Badge className="border border-primary/30 bg-primary/5 text-primary">
                      ৳ {segment.price}
                    </Badge>
                  )}
                </div>

                {isOpen ? (
                  <div className="mt-4 space-y-3">
                    {segment.subSegments.map((week, j) => (
                      <div
                        key={week._id}
                        className="rounded-md border border-border bg-background p-4"
                      >
                        <div className="flex items-center gap-2">
                          <Input
                            value={week.title}
                            onChange={(e) =>
                              updateSubSegment(
                                segment._id,
                                week._id,
                                { title: e.target.value },
                              )
                            }
                            className="h-8 flex-1"
                          />
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              moveSubSegment(
                                segment._id,
                                week._id,
                                "up",
                              )
                            }
                            disabled={j === 0}
                          >
                            <ChevronUp size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              moveSubSegment(
                                segment._id,
                                week._id,
                                "down",
                              )
                            }
                            disabled={
                              j ===
                              segment.subSegments.length - 1
                            }
                          >
                            <ChevronDown size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              removeSubSegment(
                                segment._id,
                                week._id,
                              )
                            }
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>

                        <Textarea
                          value={week.description}
                          onChange={(e) =>
                            updateSubSegment(
                              segment._id,
                              week._id,
                              { description: e.target.value },
                            )
                          }
                          rows={1}
                          className="mt-2"
                        />

                        <div className="mt-3 space-y-2">
                          {week.levels.map((level) => (
                            <div
                              key={level._id}
                              className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
                            >
                              {level.kind === "mcq" ? (
                                <FileText
                                  size={18}
                                  className="text-primary"
                                />
                              ) : (
                                <ClipboardCheck
                                  size={18}
                                  className="text-accent"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-primary">
                                  {level.title}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {level.questionIds.length}{" "}
                                  questions · {level.marks} marks
                                  · {level.durationMinutes} min
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  setLevelDialog({
                                    segmentId: segment._id,
                                    subId: week._id,
                                    levelId: level._id,
                                  })
                                }
                              >
                                <Pencil size={14} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="default"
                      onClick={() => addSubSegment(segment._id)}
                    >
                      <Plus size={14} className="mr-2" />
                      Add Week
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="sticky bottom-0 z-10 mt-6 flex justify-end gap-3 border-t border-border bg-background px-6 py-4">
        <Button variant="ghost">Cancel</Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            "Save plan"
          )}
        </Button>
      </div>

      <ExamLevelDialog
        open={levelDialog !== null}
        level={currentLevel}
        availableQuestions={questions}
        onSave={(next) => {
          if (levelDialog) {
            updateLevel(
              levelDialog.segmentId,
              levelDialog.subId,
              levelDialog.levelId,
              next,
            );
          }
        }}
        onClose={() => setLevelDialog(null)}
      />
    </div>
  );
}
