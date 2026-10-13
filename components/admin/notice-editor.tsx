"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Notice, NoticeAudience, NoticeStatus } from "@/lib/types/notice";

type NoticeForm = {
  title: string;
  excerpt: string;
  body: string;
  audience: NoticeAudience;
  pinned: boolean;
  status: NoticeStatus;
};

const blankForm: NoticeForm = {
  title: "",
  excerpt: "",
  body: "",
  audience: "all",
  pinned: false,
  status: "draft",
};

export function NoticeEditor({
  notice,
  onSaved,
}: {
  notice?: Notice | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<NoticeForm>(blankForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!notice) {
      setForm(blankForm);
      return;
    }

    setForm({
      title: notice.title,
      excerpt: notice.excerpt,
      body: notice.body,
      audience: notice.audience,
      pinned: notice.pinned,
      status: notice.status,
    });
  }, [notice]);

  const isValid =
    form.title.trim().length >= 3 &&
    form.excerpt.trim().length >= 10 &&
    form.body.trim().length >= 20;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid || saving) {
      setError("Please complete all fields before saving.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        notice ? `/api/admin/notices/${notice._id}` : "/api/admin/notices",
        {
          method: notice ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save notice.");
      }

      if (onSaved) {
        onSaved();
      } else {
        router.push("/admin/notices");
        router.refresh();
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to save notice.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {notice ? "Edit" : "Create"}
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-primary">
            {notice ? "Edit notice" : "New notice"}
          </h1>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-primary">Title</label>
          <Input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-primary">Excerpt</label>
          <Textarea
            rows={3}
            value={form.excerpt}
            onChange={(event) =>
              setForm((current) => ({ ...current, excerpt: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-primary">Body</label>
          <Textarea
            rows={6}
            value={form.body}
            onChange={(event) =>
              setForm((current) => ({ ...current, body: event.target.value }))
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Audience</label>
            <Select
              value={form.audience}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  audience: event.target.value as (typeof form)["audience"],
                }))
              }
            >
              <option value="all">All</option>
              <option value="students">Students</option>
              <option value="university">University</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Status</label>
            <Select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as (typeof form)["status"],
                }))
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Pinned</label>
            <Select
              value={form.pinned ? "yes" : "no"}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  pinned: event.target.value === "yes",
                }))
              }
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={!isValid || saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : notice ? "Update notice" : "Save notice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
