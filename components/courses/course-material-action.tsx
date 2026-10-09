"use client";

import { useState } from "react";

import { toast } from "@/components/ui/toaster";
import type { MaterialKind } from "@/lib/types/material";

export function CourseMaterialAction({
  id,
  title,
  kind,
}: {
  id: string;
  title: string;
  kind: MaterialKind;
}) {
  const [loading, setLoading] = useState(false);

  async function openMaterial() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/materials/${id}/download`);
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok) {
        const payload = contentType.includes("application/json")
          ? await response.json()
          : null;
        throw new Error(payload?.error ?? "Unable to open this material.");
      }

      if (kind === "link") {
        const payload = await response.json();
        if (!payload.success || !payload.data?.redirect) {
          throw new Error(payload.error ?? "Unable to open this link.");
        }
        window.location.assign(payload.data.redirect);
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = response.headers
        .get("content-disposition")
        ?.match(/filename="([^"]+)"/i)?.[1];
      link.href = objectUrl;
      link.download =
        filename ?? `${title}.${kind === "doc" ? "doc" : "pdf"}`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
    } catch (error) {
      console.error("Open course material error", error);
      toast(
        error instanceof Error ? error.message : "Unable to open this material.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void openMaterial()}
      disabled={loading}
      className="text-sm font-medium text-accent hover:underline disabled:opacity-60"
    >
      {loading ? "Opening…" : kind === "link" ? "View" : "Download"}
    </button>
  );
}
