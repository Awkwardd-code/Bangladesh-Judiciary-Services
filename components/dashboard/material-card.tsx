"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Download,
  FileText,
  Link as LinkIcon,
  Lock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import type { MaterialKind } from "@/lib/types/material";

export type MaterialSummary = {
  id: string;
  title: string;
  description?: string;
  kind: MaterialKind;
  sizeBytes?: number;
  isFreePreview: boolean;
};

export function MaterialCard({
  material,
  hasAccess,
}: {
  material: MaterialSummary;
  hasAccess: boolean;
}) {
  const [opening, setOpening] = useState(false);
  const Icon = material.kind === "link" ? LinkIcon : FileText;
  const sizeLabel =
    material.sizeBytes && material.sizeBytes > 0
      ? `${(material.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : null;
  const locked = !hasAccess && !material.isFreePreview;

  async function downloadFile() {
    if (opening) return;
    setOpening(true);
    try {
      const response = await fetch(
        `/api/materials/${material.id}/download`,
      );
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to download this file.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = response.headers
        .get("content-disposition")
        ?.match(/filename="([^"]+)"/i)?.[1];
      link.href = objectUrl;
      link.download =
        filename ??
        `${material.title}.${material.kind === "doc" ? "doc" : "pdf"}`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
    } catch (error) {
      console.error("Download course material error", error);
      toast(
        error instanceof Error
          ? error.message
          : "Unable to download this file.",
        "error",
      );
    } finally {
      setOpening(false);
    }
  }

  async function openLink() {
    if (opening) return;
    const popup = window.open("about:blank", "_blank");
    setOpening(true);
    try {
      const response = await fetch(
        `/api/materials/${material.id}/download`,
      );
      const payload = await response.json();
      if (!response.ok || !payload.success || !payload.data?.redirect) {
        throw new Error(payload.error ?? "Unable to open this link.");
      }
      if (popup) {
        popup.location.href = payload.data.redirect;
      } else {
        window.location.assign(payload.data.redirect);
      }
    } catch (error) {
      popup?.close();
      console.error("Open course material link error", error);
      toast(
        error instanceof Error ? error.message : "Unable to open this link.",
        "error",
      );
    } finally {
      setOpening(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon size={20} className="text-accent" />
        <Badge className="border-border bg-transparent px-2 py-1 text-[11px] uppercase tracking-wide text-muted">
          {material.kind}
        </Badge>
        {material.isFreePreview && !hasAccess ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700">
            Free preview
          </Badge>
        ) : null}
      </div>

      <h3 className="line-clamp-2 font-sans text-[15px] font-semibold text-primary">
        {material.title}
      </h3>
      {material.description ? (
        <p className="line-clamp-2 text-[13px] text-muted">
          {material.description}
        </p>
      ) : null}
      {sizeLabel ? (
        <p className="text-xs text-muted">{sizeLabel}</p>
      ) : null}

      <div className="mt-auto pt-2">
        {locked ? (
          <button
            type="button"
            disabled
            title="Enroll to access this material."
            className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-md border border-border px-3 text-sm text-muted opacity-70"
          >
            <Lock size={16} />
            Locked · Enroll to access
          </button>
        ) : material.kind === "link" ? (
          <button
            type="button"
            onClick={() => void openLink()}
            disabled={opening}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-3 text-sm text-cream disabled:opacity-60"
          >
            {opening ? "Opening…" : "Open"}
            <ArrowUpRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void downloadFile()}
            disabled={opening}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-3 text-sm text-cream disabled:opacity-60"
          >
            {opening ? "Downloading…" : "Download"}
            <Download size={16} />
          </button>
        )}
      </div>
    </Card>
  );
}
