"use client";

import { Globe, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

type PublishButtonProps = {
  kind: "preliminary" | "written";
  examId: string;
  status: "draft" | "published" | "archived";
  questionCount: number;
  onChanged: () => void;
};

export function PublishButton({
  kind,
  examId,
  status,
  questionCount,
  onChanged,
}: PublishButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePublish(nextStatus: "draft" | "published") {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/${kind === "preliminary" ? "preliminary-exams" : "written-exams"}/${examId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast(payload?.error ?? "Unable to update exam status.", "error");
        return;
      }

      toast(
        nextStatus === "published"
          ? "Exam published."
          : "Exam moved back to draft.",
      );
      onChanged();
    } catch (error) {
      console.error("Publish exam error", error);
      toast("Unable to update the exam right now.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "published") {
    return (
      <Button
        type="button"
        onClick={() => void handlePublish("draft")}
        disabled={loading}
        className="border border-border bg-white text-primary hover:bg-primary/5"
      >
        <EyeOff size={16} />
        Unpublish
      </Button>
    );
  }

  const isBlocked = questionCount === 0;

  return (
    <Button
      type="button"
      onClick={() => void handlePublish("published")}
      disabled={loading || isBlocked}
      title={
        isBlocked ? "Add at least one question before publishing." : undefined
      }
      className="bg-primary text-cream hover:bg-primary/90"
    >
      <Globe size={16} />
      Publish
    </Button>
  );
}
