"use client";

import Image from "next/image";
import { ImagePlus, Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

import { uploadToCloudinary } from "@/lib/cloudinary-client";

type ImageUploaderProps = {
  value: string | null;
  publicId: string | null;
  onChange: (value: { url: string | null; publicId: string | null }) => void;
  folder: string;
  aspect?: "square" | "video" | "free";
  size?: number;
  helperText?: string;
  disabled?: boolean;
};

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxSize = 5 * 1024 * 1024;

export function ImageUploader({
  value,
  publicId,
  onChange,
  folder,
  aspect = "square",
  size = 96,
  helperText,
  disabled = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState(value);
  const [previewPublicId, setPreviewPublicId] = useState(publicId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const squareStyle =
    aspect === "square" ? { width: size, height: size } : undefined;
  const previewWrapperClass =
    aspect === "square"
      ? "relative h-24 w-24 overflow-hidden rounded-full border border-border bg-background"
      : aspect === "video"
        ? "relative aspect-video w-full max-w-xs overflow-hidden rounded-md border border-border bg-background"
        : "relative h-40 w-full max-w-xs overflow-hidden rounded-md border border-border bg-background";
  const emptyBoxClass =
    aspect === "square"
      ? "flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-full border border-dashed border-border bg-background text-muted transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      : "flex h-32 w-full max-w-xs cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-background text-muted transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  function handleEditClick() {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, or WebP.");
      return;
    }

    if (file.size > maxSize) {
      setError("Max 5 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadToCloudinary(file, folder);
      const oldPublicId = previewPublicId;

      setPreviewUrl(result.secureUrl);
      setPreviewPublicId(result.publicId);
      onChange({ url: result.secureUrl, publicId: result.publicId });

      if (oldPublicId && oldPublicId !== result.publicId) {
        void deleteRemoteImage(oldPublicId);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to upload image.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (previewPublicId) {
      await deleteRemoteImage(previewPublicId);
    }

    setPreviewUrl(null);
    setPreviewPublicId(null);
    onChange({ url: null, publicId: null });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative inline-flex">
        {previewUrl ? (
          <div className={previewWrapperClass} style={squareStyle}>
            <Image
              src={previewUrl}
              alt="Uploaded"
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-primary/60 opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                onClick={handleEditClick}
                aria-label="Replace image"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-card text-primary hover:bg-accent hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                aria-label="Remove image"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-card text-red-600 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleEditClick}
            disabled={disabled || uploading}
            className={emptyBoxClass}
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin text-accent" />
            ) : (
              <>
                <Upload size={20} className="text-muted" />
                <ImagePlus size={14} className="mt-1 text-muted" />
                <span className="text-xs text-muted">Upload image</span>
              </>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || uploading}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {helperText && !error ? (
        <p className="text-xs text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}

async function deleteRemoteImage(publicId: string) {
  try {
    await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    });
  } catch {
    // Cleanup is best effort after the replacement or removal is visible.
  }
}
