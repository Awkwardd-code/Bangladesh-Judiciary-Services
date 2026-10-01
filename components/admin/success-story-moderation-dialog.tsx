"use client";

import { useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import type { AdminSuccessStory } from "@/components/admin/success-story-editor";

type ModerationMode = "approve" | "reject";

export function SuccessStoryModerationDialog({
  story,
  mode,
  onModerated,
  children,
}: {
  story: AdminSuccessStory;
  mode: ModerationMode;
  onModerated: () => void;
  children: ReactNode;
}) {
  const [error, setError] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");

  async function moderate() {
    setError("");

    try {
      const response = await fetch(`/api/admin/success-stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: mode === "approve" ? "approved" : "rejected",
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to moderate story.");
      }

      onModerated();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to moderate story.",
      );
    }
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger>{children}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {mode === "approve"
                ? "Approve this story?"
                : "Reject this story?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {mode === "approve"
                ? `${story.authorName}'s story will be visible on the public site.`
                : `${story.authorName}'s story will be marked as rejected.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {mode === "reject" ? (
            <label className="mt-3 block text-sm text-primary">
              Optional note
              <Textarea
                rows={3}
                value={rejectionNote}
                onChange={(event) => setRejectionNote(event.target.value)}
                className="mt-2"
                placeholder="This note is not stored."
              />
            </label>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void moderate()}>
              {mode === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </>
  );
}
