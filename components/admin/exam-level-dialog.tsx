"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { SerializedExamLevel } from "@/lib/types/exam";

export type AvailableQuestion = {
  id: string;
  questionText: string;
  kind: "preliminary" | "written";
  marks: number;
  subject?: string;
};

export type ExamLevelDialogProps = {
  open: boolean;
  level: SerializedExamLevel | null;
  availableQuestions: AvailableQuestion[];
  onSave: (next: SerializedExamLevel) => void;
  onClose: () => void;
};

export function ExamLevelDialog({
  open,
  level,
  availableQuestions,
  onSave,
  onClose,
}: ExamLevelDialogProps) {
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passMarkPercent, setPassMarkPercent] = useState(50);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(),
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!level) {
      return;
    }

    setTitle(level.title);
    setDurationMinutes(level.durationMinutes);
    setPassMarkPercent(level.passMarkPercent);
    setSelectedIds(new Set(level.questionIds));
    setSearch("");
  }, [level]);

  const filteredQuestions = useMemo(() => {
    if (!level) return [];
    const wantedKind =
      level.kind === "mcq" ? "preliminary" : "written";
    const needle = search.trim().toLowerCase();
    return availableQuestions
      .filter((q) => q.kind === wantedKind)
      .filter((q) =>
        needle === ""
          ? true
          : q.questionText.toLowerCase().includes(needle),
      );
  }, [availableQuestions, level, search]);

  const totalMarks = useMemo(() => {
    let sum = 0;
    for (const q of availableQuestions) {
      if (selectedIds.has(q.id)) {
        sum += q.marks;
      }
    }
    return sum;
  }, [availableQuestions, selectedIds]);

  const toggleQuestion = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!level) return;
    onSave({
      _id: level._id,
      title: title.trim() || "Level",
      kind: level.kind,
      questionIds: Array.from(selectedIds),
      durationMinutes: Math.max(1, durationMinutes),
      passMarkPercent: Math.min(
        100,
        Math.max(1, passMarkPercent),
      ),
      marks: totalMarks,
    });
    onClose();
  };

  if (!open || !level) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h3 className="font-heading text-lg font-semibold text-primary">
              {level.title || "Level"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure questions, time, and pass mark.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close level editor"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-primary/5"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="level-title">Title</Label>
              <Input
                id="level-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="level-duration">
                Duration (min)
              </Label>
              <Input
                id="level-duration"
                type="number"
                value={durationMinutes}
                onChange={(e) =>
                  setDurationMinutes(Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="level-pass">
                Pass mark (%)
              </Label>
              <Input
                id="level-pass"
                type="number"
                value={passMarkPercent}
                onChange={(e) =>
                  setPassMarkPercent(Number(e.target.value))
                }
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                Questions ({selectedIds.size} selected)
              </h4>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-2.5 text-muted-foreground"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions…"
                  className="h-9 w-64 pl-8"
                />
              </div>
            </div>

            <div className="mt-3 max-h-80 overflow-y-auto rounded-md border border-border divide-y divide-border">
              {filteredQuestions.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No questions available. Add questions to the exam first.
                </p>
              ) : (
                filteredQuestions.map((q) => (
                  <label
                    key={q.id}
                    className="flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-primary/[0.03]"
                  >
                    <Checkbox
                      checked={selectedIds.has(q.id)}
                      onCheckedChange={() => toggleQuestion(q.id)}
                    />
                    <div className="flex-1">
                      <p className="line-clamp-2 text-sm text-foreground">
                        {q.questionText}
                      </p>
                      <p className="mt-1 flex gap-3 text-xs text-muted-foreground">
                        <span>{q.subject ?? "General"}</span>
                        <span>{q.marks} marks</span>
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
          <p className="mr-auto text-sm text-muted-foreground">
            Total marks: {totalMarks}
          </p>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save level</Button>
        </div>
      </div>
    </div>
  );
}
