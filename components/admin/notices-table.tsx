"use client";

import { Megaphone, Pin, Plus, Save, Trash2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { NoticesFilter } from "@/components/admin/notices-filter";
import { ListSkeleton } from "@/components/skeletons/list-skeleton";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { buildQuery } from "@/lib/query-params";

type Notice = {
  _id: string;
  title: string;
  excerpt: string;
  body: string;
  status: "draft" | "published";
  audience: string;
  pinned: boolean;
  publishedAt?: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const emptyPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const blank = {
  title: "",
  excerpt: "",
  body: "",
  audience: "all",
  pinned: false,
  status: "draft",
};

export function NoticesTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [touched, setTouched] = useState({
    title: false,
    excerpt: false,
    body: false,
  });
  const formValid =
    form.title.trim().length >= 3 &&
    form.excerpt.trim().length >= 10 &&
    form.body.trim().length >= 20;

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/notices?${query}`);
    const result = (await response.json()) as {
      data?: { notices?: Notice[]; pagination?: Pagination };
    };
    setNotices(result.data?.notices ?? []);
    setPagination(result.data?.pagination ?? emptyPagination);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  function openEditor(notice?: Notice) {
    setEditing(notice ?? null);
    setModalOpen(true);
    setFormError("");
    setTouched({ title: false, excerpt: false, body: false });
    setForm(
      notice
        ? {
            title: notice.title,
            excerpt: notice.excerpt,
            body: notice.body,
            audience: notice.audience,
            pinned: notice.pinned,
            status: notice.status,
          }
        : blank
    );
  }

  async function save() {
    setTouched({ title: true, excerpt: true, body: true });
    if (!formValid || saving) return;

    setSaving(true);
    setFormError("");
    const endpoint = editing
      ? `/api/admin/notices/${editing._id}`
      : "/api/admin/notices";
    try {
      const response = await fetch(endpoint, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to save notice.");
      }
      setEditing(null);
      setModalOpen(false);
      await load();
    } catch (cause) {
      setFormError(
        cause instanceof Error ? cause.message : "Unable to save notice."
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (window.confirm("Delete this notice?")) {
      await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      await load();
    }
  }

  function changePage(page: number) {
    const current = new URLSearchParams(searchParams.toString());
    const nextQuery = buildQuery(current, { page });
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }

  return (
    <>
      <div className="mt-5 flex justify-end">
        <ButtonWithIcon
          type="button"
          icon={Plus}
          onClick={() => openEditor()}
          className="rounded-md"
        >
          New notice
        </ButtonWithIcon>
      </div>
      <NoticesFilter />
      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <ListSkeleton count={8} hasThumb={false} />
        ) : notices.length === 0 ? (
          <div className="p-10 text-center">
            <Megaphone className="mx-auto text-muted" size={36} />
            <p className="mt-3 text-sm text-muted">No notices yet.</p>
            <button
              type="button"
              onClick={() => openEditor()}
              className="mt-4 cursor-pointer text-sm text-accent"
            >
              Create the first notice
            </button>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice._id}
              className="flex flex-col gap-3 border-b border-border p-5 last:border-0 md:flex-row md:items-center md:justify-between"
            >
              <button
                type="button"
                onClick={() => openEditor(notice)}
                className="cursor-pointer text-left"
              >
                <p className="font-medium text-primary">{notice.title}</p>
                <p className="mt-1 text-sm text-muted">{notice.excerpt}</p>
              </button>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    notice.status === "published"
                      ? "border-emerald-600/30 text-emerald-700"
                      : "text-muted"
                  }
                >
                  {notice.status}
                </Badge>
                {notice.pinned ? (
                  <Pin size={16} className="text-accent" />
                ) : null}
                <button
                  type="button"
                  aria-label="Delete notice"
                  onClick={() => remove(notice._id)}
                  className="cursor-pointer p-2 text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={changePage}
      />
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4">
          <div className="w-full max-w-xl rounded-lg border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold text-primary">
              {editing ? "Edit notice" : "New notice"}
            </h2>
            <div className="mt-5 space-y-3">
              <Input
                placeholder="Title"
                value={form.title}
                minLength={3}
                maxLength={200}
                required
                onBlur={() =>
                  setTouched((current) => ({ ...current, title: true }))
                }
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
              {touched.title && form.title.trim().length < 3 ? (
                <p className="text-xs text-red-600">
                  Title must be 3+ characters.
                </p>
              ) : null}
              <Input
                placeholder="Excerpt"
                value={form.excerpt}
                minLength={10}
                maxLength={300}
                required
                onBlur={() =>
                  setTouched((current) => ({ ...current, excerpt: true }))
                }
                onChange={(event) =>
                  setForm({ ...form, excerpt: event.target.value })
                }
              />
              {touched.excerpt && form.excerpt.trim().length < 10 ? (
                <p className="text-xs text-red-600">
                  Excerpt must be 10+ characters.
                </p>
              ) : null}
              <Textarea
                rows={8}
                placeholder="Body"
                value={form.body}
                minLength={20}
                maxLength={10000}
                required
                onBlur={() =>
                  setTouched((current) => ({ ...current, body: true }))
                }
                onChange={(event) =>
                  setForm({ ...form, body: event.target.value })
                }
              />
              {touched.body && form.body.trim().length < 20 ? (
                <p className="text-xs text-red-600">
                  Body must be 20+ characters.
                </p>
              ) : null}
              <Select
                value={form.audience}
                onChange={(event) =>
                  setForm({ ...form, audience: event.target.value })
                }
              >
                <option value="all">All</option>
                <option value="students">Students</option>
                <option value="university">University</option>
                <option value="other">Other</option>
              </Select>
              <Select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={(event) =>
                    setForm({ ...form, pinned: event.target.checked })
                  }
                />
                Pinned
              </label>
            </div>
            {formError ? (
              <p
                role="alert"
                className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
              >
                {formError}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <ButtonWithIcon
                type="button"
                icon={X}
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setModalOpen(false);
                  setForm(blank);
                }}
                className="text-muted"
              >
                Cancel
              </ButtonWithIcon>
              <ButtonWithIcon
                type="button"
                icon={Save}
                disabled={!formValid || saving}
                onClick={save}
                className="rounded-md"
              >
                {saving ? "Saving..." : "Save"}
              </ButtonWithIcon>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
