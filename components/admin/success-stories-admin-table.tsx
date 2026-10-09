"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  SuccessStoryEditor,
  type AdminSuccessStory,
} from "@/components/admin/success-story-editor";
import { SuccessStoryModerationDialog } from "@/components/admin/success-story-moderation-dialog";
import { TableRowsSkeleton } from "@/components/skeletons/table-rows-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PaginationBar } from "@/components/ui/pagination-bar";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type StoryResponse = {
  stories?: AdminSuccessStory[];
  pagination?: Pagination;
};

const emptyPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export function SuccessStoriesAdminTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const [stories, setStories] = useState<AdminSuccessStory[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSuccessStory>();
  const [selected, setSelected] = useState<AdminSuccessStory | null>(null);

  const refreshStories = useCallback(() => {
    setReloadKey((current) => current + 1);
    window.dispatchEvent(new Event("refresh-success-story-summary"));
  }, []);

  const loadStories = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      params.set("limit", "20");

      try {
        const response = await fetch(`/api/admin/success-stories?${params}`, {
          signal,
        });
        const result = (await response.json()) as {
          error?: string;
          data?: StoryResponse;
        };

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load stories.");
        }

        setStories(result.data?.stories ?? []);
        setPagination(result.data?.pagination ?? emptyPagination);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load stories."
        );
      } finally {
        setLoading(false);
      }
    },
    [page, searchParams]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadStories(controller.signal);

    return () => controller.abort();
  }, [loadStories, reloadKey]);

  useEffect(() => {
    function openEditor() {
      setEditing(undefined);
      setEditorOpen(true);
    }

    window.addEventListener("open-success-story-editor", openEditor);
    return () => {
      window.removeEventListener("open-success-story-editor", openEditor);
    };
  }, []);

  function changePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function openEditor(story?: AdminSuccessStory) {
    setEditing(story);
    setEditorOpen(true);
  }

  async function toggleFeatured(story: AdminSuccessStory) {
    const response = await fetch(`/api/admin/success-stories/${story.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !story.isFeatured }),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Unable to update featured state.");
      return;
    }

    refreshStories();
  }

  async function deleteStory(story: AdminSuccessStory) {
    if (!window.confirm(`Delete ${story.authorName}'s story?`)) {
      return;
    }

    const response = await fetch(`/api/admin/success-stories/${story.id}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Unable to delete story.");
      return;
    }

    setSelected(null);
    refreshStories();
  }

  async function loadAllStoryIds() {
    const firstResponse = await fetch(
      "/api/admin/success-stories?page=1&limit=100"
    );
    const firstResult = (await firstResponse.json()) as {
      error?: string;
      data?: { stories?: AdminSuccessStory[]; pagination?: Pagination };
    };

    if (!firstResponse.ok || !firstResult.data?.pagination) {
      throw new Error(firstResult.error ?? "Unable to load story order.");
    }

    const allStories = [...(firstResult.data.stories ?? [])];
    const totalPages = firstResult.data.pagination.totalPages;

    for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
      const response = await fetch(
        `/api/admin/success-stories?page=${currentPage}&limit=100`
      );
      const result = (await response.json()) as {
        error?: string;
        data?: { stories?: AdminSuccessStory[] };
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to load story order.");
      }

      allStories.push(...(result.data?.stories ?? []));
    }

    return allStories.map((story) => story.id);
  }

  async function moveStory(storyId: string, direction: -1 | 1) {
    try {
      const orderedIds = await loadAllStoryIds();
      const index = orderedIds.indexOf(storyId);
      const targetIndex = index + direction;

      if (index < 0 || targetIndex < 0 || targetIndex >= orderedIds.length) {
        return;
      }

      [orderedIds[index], orderedIds[targetIndex]] = [
        orderedIds[targetIndex],
        orderedIds[index],
      ];

      const response = await fetch("/api/admin/success-stories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to reorder stories.");
      }

      refreshStories();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reorder stories."
      );
    }
  }

  return (
    <>
      {error ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <TableRowsSkeleton
            rows={8}
            columns={6}
            widths={["w-3/4", "w-1/2", "w-5/6", "w-2/3", "w-1/3", "w-1/2"]}
          />
        ) : stories.length === 0 ? (
          <div className="p-10 text-center">
            <Sparkles
              aria-hidden="true"
              size={36}
              className="mx-auto text-muted"
            />
            <p className="mt-3 text-sm text-muted">No stories yet.</p>
            <button
              type="button"
              onClick={() => openEditor()}
              className="mt-4 cursor-pointer text-sm font-medium text-accent hover:underline"
            >
              Add your first story
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">University</th>
                    <th className="px-4 py-3">Achievement</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Featured</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stories.map((story, index) => (
                    <tr
                      key={story.id}
                      tabIndex={0}
                      role="button"
                      className="cursor-pointer hover:bg-primary/[0.025]"
                      onClick={() => setSelected(story)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelected(story);
                        }
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {story.authorPhotoUrl ? (
                            <Image
                              src={story.authorPhotoUrl}
                              alt=""
                              width={36}
                              height={36}
                              unoptimized
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <InitialAvatar name={story.authorName} />
                          )}
                          <div>
                            <p className="font-medium text-primary">
                              {story.authorName}
                            </p>
                            <p className="text-xs text-muted">
                              {story.authorEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {story.authorUniversity}
                        <span className="block text-xs text-muted">
                          {story.authorBatch}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="border-accent text-accent">
                          {story.achievement}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <StoryStatus status={story.status} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          aria-label={
                            story.isFeatured
                              ? "Unfeature story"
                              : "Feature story"
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            void toggleFeatured(story);
                          }}
                          className="cursor-pointer"
                        >
                          <Star
                            size={17}
                            className={
                              story.isFeatured
                                ? "fill-amber-400 text-amber-500"
                                : "text-muted"
                            }
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {formatRelative(story.createdAt)}
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <StoryActions
                          story={story}
                          onView={() => setSelected(story)}
                          onEdit={() => openEditor(story)}
                          onToggleFeatured={() => void toggleFeatured(story)}
                          onMoveUp={() => void moveStory(story.id, -1)}
                          onMoveDown={() => void moveStory(story.id, 1)}
                          onModerated={refreshStories}
                          onDelete={() => void deleteStory(story)}
                          canMoveUp={index > 0}
                          canMoveDown={index < stories.length - 1}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border md:hidden">
              {stories.map((story) => (
                <article key={story.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {story.authorPhotoUrl ? (
                      <Image
                        src={story.authorPhotoUrl}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <InitialAvatar name={story.authorName} />
                    )}
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setSelected(story)}
                        className="cursor-pointer text-left"
                      >
                        <span className="block truncate text-sm font-medium text-primary">
                          {story.authorName}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {story.authorUniversity} · {story.authorBatch}
                        </span>
                      </button>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StoryStatus status={story.status} />
                        {story.isFeatured ? (
                          <Badge className="border-accent text-accent">
                            Featured
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <StoryActions
                      story={story}
                      onView={() => setSelected(story)}
                      onEdit={() => openEditor(story)}
                      onToggleFeatured={() => void toggleFeatured(story)}
                      onMoveUp={() => void moveStory(story.id, -1)}
                      onMoveDown={() => void moveStory(story.id, 1)}
                      onModerated={refreshStories}
                      onDelete={() => void deleteStory(story)}
                      canMoveUp
                      canMoveDown
                    />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted">
                    {story.quote}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={changePage}
      />

      <SuccessStoryEditor
        story={editing}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSaved={refreshStories}
      />

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent
          side="right"
          aria-label="Success story details"
          className="w-full max-w-xl overflow-y-auto p-6 sm:w-[520px]"
        >
          {selected ? (
            <StoryDetails
              story={selected}
              onEdit={() => openEditor(selected)}
              onModerated={() => {
                setSelected(null);
                refreshStories();
              }}
              onDelete={() => void deleteStory(selected)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function StoryActions({
  story,
  onView,
  onEdit,
  onToggleFeatured,
  onMoveUp,
  onMoveDown,
  onModerated,
  onDelete,
  canMoveUp,
  canMoveDown,
}: {
  story: AdminSuccessStory;
  onView: () => void;
  onEdit: () => void;
  onToggleFeatured: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onModerated: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <DropdownMenu closeOnOutsideClick>
      <DropdownMenuTrigger>
        <button
          type="button"
          aria-label={`Actions for ${story.authorName}`}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5"
        >
          <MoreHorizontal size={18} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        <DropdownMenuItem onClick={onView}>View</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil size={14} />
          Edit
        </DropdownMenuItem>
        {story.status === "pending" ? (
          <>
            <SuccessStoryModerationDialog
              story={story}
              mode="approve"
              onModerated={onModerated}
            >
              <DropdownMenuItem>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  Approve
                </span>
              </DropdownMenuItem>
            </SuccessStoryModerationDialog>
            <SuccessStoryModerationDialog
              story={story}
              mode="reject"
              onModerated={onModerated}
            >
              <DropdownMenuItem>
                <span className="inline-flex items-center gap-2">
                  <XCircle size={15} />
                  Reject
                </span>
              </DropdownMenuItem>
            </SuccessStoryModerationDialog>
          </>
        ) : null}
        <DropdownMenuItem onClick={onToggleFeatured}>
          <span className="inline-flex items-center gap-2">
            <Star size={15} />
            {story.isFeatured ? "Unfeature" : "Feature"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canMoveUp} onClick={onMoveUp}>
          <ArrowUp size={14} />
          Move up
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canMoveDown} onClick={onMoveDown}>
          <ArrowDown size={14} />
          Move down
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} destructive>
          <span className="inline-flex items-center gap-2">
            <Trash2 size={15} />
            Delete
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StoryDetails({
  story,
  onEdit,
  onModerated,
  onDelete,
}: {
  story: AdminSuccessStory;
  onEdit: () => void;
  onModerated: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="pb-8">
      <div className="flex items-start gap-4">
        {story.authorPhotoUrl ? (
          <Image
            src={story.authorPhotoUrl}
            alt={story.authorName}
            width={72}
            height={72}
            unoptimized
            className="h-[72px] w-[72px] rounded-full object-cover"
          />
        ) : (
          <InitialAvatar name={story.authorName} />
        )}
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-bold text-primary">
            {story.authorName}
          </h2>
          <p className="mt-1 break-all text-sm text-muted">
            {story.authorEmail}
          </p>
          <p className="mt-1 text-sm text-muted">
            {story.authorUniversity} · {story.authorBatch}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <StoryStatus status={story.status} />
        {story.isFeatured ? (
          <Badge className="border-accent text-accent">Featured</Badge>
        ) : null}
        <Badge className="border-accent text-accent">{story.achievement}</Badge>
      </div>
      <blockquote className="mt-6 border-l-2 border-accent pl-4 text-base leading-7 text-foreground">
        {story.quote}
      </blockquote>
      {story.fullStory ? (
        <div className="mt-5 whitespace-pre-line text-sm leading-7 text-muted">
          {story.fullStory}
        </div>
      ) : null}
      <div className="mt-7 flex flex-wrap gap-2 border-t border-border pt-5">
        {story.status === "pending" ? (
          <>
            <SuccessStoryModerationDialog
              story={story}
              mode="approve"
              onModerated={onModerated}
            >
              <button
                type="button"
                className="h-10 cursor-pointer rounded-md bg-primary px-4 text-sm text-cream"
              >
                Approve
              </button>
            </SuccessStoryModerationDialog>
            <SuccessStoryModerationDialog
              story={story}
              mode="reject"
              onModerated={onModerated}
            >
              <button
                type="button"
                className="h-10 cursor-pointer rounded-md border border-border px-4 text-sm text-primary"
              >
                Reject
              </button>
            </SuccessStoryModerationDialog>
          </>
        ) : null}
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-4 text-sm text-primary"
        >
          <Pencil size={15} />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-red-200 px-4 text-sm text-red-600"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </div>
  );
}

function StoryStatus({ status }: { status: AdminSuccessStory["status"] }) {
  const styles = {
    pending: "border-amber-300 bg-amber-50 text-amber-800",
    approved: "border-emerald-600/30 bg-emerald-50 text-emerald-700",
    rejected: "border-red-200 bg-red-50 text-red-700",
  };

  return <Badge className={styles[status]}>{status}</Badge>;
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-cream">
      {initials}
    </span>
  );
}

function formatRelative(value: string) {
  const elapsedSeconds = (Date.now() - new Date(value).getTime()) / 1000;
  const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const intervals: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];

  for (const [unit, seconds] of intervals) {
    if (Math.abs(elapsedSeconds) >= seconds) {
      return relative.format(-Math.round(elapsedSeconds / seconds), unit);
    }
  }

  return relative.format(0, "second");
}
