"use client";

import {
  ChevronDown,
  ChevronUp,
  FileText,
  FolderOpen,
  Link as LinkIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import {
  EditableMaterial,
  MaterialEditor,
} from "@/components/admin/material-editor";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";

export function CourseMaterialsTab({
  courseId,
  initialMaterials,
}: {
  courseId: string;
  initialMaterials: EditableMaterial[];
}) {
  const [materials, setMaterials] = useState(initialMaterials);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<EditableMaterial | null>(null);
  const [deletingMaterial, setDeletingMaterial] =
    useState<EditableMaterial | null>(null);
  const [busy, setBusy] = useState(false);

  async function reloadMaterials() {
    const response = await fetch(
      `/api/admin/courses/${courseId}/materials`,
      { cache: "no-store" },
    );
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error ?? "Unable to load course materials.");
    }
    setMaterials(
      result.data.materials.map(
        (material: EditableMaterial & { _id: unknown; courseId: unknown }) => ({
          ...material,
          _id: String(material._id),
          courseId: String(material.courseId),
        }),
      ),
    );
  }

  async function reorder(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= materials.length || busy) return;

    const current = materials[index];
    const adjacent = materials[nextIndex];
    setBusy(true);
    try {
      const [firstResponse, secondResponse] = await Promise.all([
        fetch(
          `/api/admin/courses/${courseId}/materials/${current._id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: adjacent.order }),
          },
        ),
        fetch(
          `/api/admin/courses/${courseId}/materials/${adjacent._id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: current.order }),
          },
        ),
      ]);
      const results = await Promise.all([
        firstResponse.json(),
        secondResponse.json(),
      ]);
      if (
        !firstResponse.ok ||
        !secondResponse.ok ||
        results.some((result) => !result.success)
      ) {
        throw new Error("Unable to reorder materials.");
      }
      await reloadMaterials();
    } catch (error) {
      console.error("Reorder course materials error", error);
      toast(
        error instanceof Error ? error.message : "Unable to reorder materials.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteMaterial() {
    if (!deletingMaterial || busy) return;
    setBusy(true);
    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/materials/${deletingMaterial._id}`,
        { method: "DELETE" },
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to delete material.");
      }
      setDeletingMaterial(null);
      await reloadMaterials();
      toast("Material deleted.");
    } catch (error) {
      console.error("Delete course material error", error);
      toast(
        error instanceof Error ? error.message : "Unable to delete material.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  function openAdd() {
    setEditingMaterial(null);
    setEditorOpen(true);
  }

  function handleSaved(material: EditableMaterial) {
    setMaterials((current) => {
      const exists = current.some((item) => item._id === material._id);
      return exists
        ? current.map((item) =>
            item._id === material._id ? material : item,
          )
        : [...current, material].sort((left, right) => left.order - right.order);
    });
  }

  const totalSize = materials.reduce(
    (total, material) => total + (material.sizeBytes ?? 0),
    0,
  );

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-primary">
            Course materials
          </h2>
          <p className="mt-1 text-sm text-muted">
            {materials.length} {materials.length === 1 ? "item" : "items"} ·{" "}
            {(totalSize / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm text-cream"
        >
          <Plus size={16} />
          Add material
        </button>
      </header>

      {materials.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-dashed p-10 text-center">
          <FolderOpen className="text-muted" size={30} />
          <p className="text-sm text-muted">No materials yet.</p>
          <button
            type="button"
            onClick={openAdd}
            className="cursor-pointer text-sm font-medium text-primary underline"
          >
            Add your first material
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {materials.map((material, index) => {
            const Icon = material.kind === "link" ? LinkIcon : FileText;
            return (
              <Card
                key={material._id}
                className="flex flex-wrap items-center gap-4 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/5 text-primary">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-primary">
                    {material.title}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {material.kind.toUpperCase()} ·{" "}
                    {formatSize(material.sizeBytes)} · Order {material.order}
                  </p>
                  {material.isFreePreview ? (
                    <span className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                      Free preview
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <IconButton
                    label="Move up"
                    disabled={busy || index === 0}
                    onClick={() => void reorder(index, -1)}
                  >
                    <ChevronUp size={16} />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    disabled={busy || index === materials.length - 1}
                    onClick={() => void reorder(index, 1)}
                  >
                    <ChevronDown size={16} />
                  </IconButton>
                  <IconButton
                    label={`Edit ${material.title}`}
                    disabled={busy}
                    onClick={() => {
                      setEditingMaterial(material);
                      setEditorOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    label={`Delete ${material.title}`}
                    disabled={busy}
                    onClick={() => setDeletingMaterial(material)}
                    destructive
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <MaterialEditor
        key={editingMaterial?._id ?? "new-material"}
        courseId={courseId}
        material={editingMaterial}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onCancel={() => {
          setEditorOpen(false);
          setEditingMaterial(null);
        }}
        onSaved={handleSaved}
      />

      {deletingMaterial ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-primary-dark/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeletingMaterial(null);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-material-title"
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <h2
              id="delete-material-title"
              className="font-heading text-xl font-semibold text-primary"
            >
              Delete this material?
            </h2>
            <p className="mt-2 text-sm text-muted">{deletingMaterial.title}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingMaterial(null)}
                className="h-10 cursor-pointer rounded-md border border-border px-4 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void deleteMaterial()}
                disabled={busy}
                className="h-10 cursor-pointer rounded-md bg-red-600 px-4 text-sm text-white disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  destructive,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md
        text-muted hover:bg-primary/5 hover:text-primary
        disabled:cursor-not-allowed disabled:opacity-40
        ${destructive ? "hover:bg-red-50 hover:text-red-600" : ""}`}
    >
      {children}
    </button>
  );
}

function formatSize(sizeBytes?: number) {
  return sizeBytes ? `${(sizeBytes / 1024 / 1024).toFixed(1)} MB` : "—";
}
