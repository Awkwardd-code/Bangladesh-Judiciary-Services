"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  EyeOff,
  Globe,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { MentorEditor } from "@/components/admin/mentor-editor";
import { MentorsFilter } from "@/components/admin/mentors-filter";
import { TableRowsSkeleton } from "@/components/skeletons/table-rows-skeleton";
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
import { Badge } from "@/components/ui/badge";
import { PaginationBar } from "@/components/ui/pagination-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MentorRecord } from "@/lib/types/mentor";

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
  totalPages: 0,
};

export function MentorsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const search = searchParams.get("search") ?? "";
  const isPublished = searchParams.get("isPublished") ?? "all";
  const [mentors, setMentors] = useState<MentorRecord[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<MentorRecord>();
  const [deletingMentor, setDeletingMentor] = useState<MentorRecord>();
  const [busyId, setBusyId] = useState("");

  const loadMentors = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
          search,
          isPublished,
        });
        const response = await fetch(`/api/admin/mentors?${params}`, {
          signal,
        });
        const result = (await response.json()) as {
          error?: string;
          data?: {
            mentors?: MentorRecord[];
            pagination?: Pagination;
          };
        };

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load mentors.");
        }

        setMentors(result.data?.mentors ?? []);
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
            : "Unable to load mentors."
        );
      } finally {
        setLoading(false);
      }
    },
    [isPublished, page, search]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadMentors(controller.signal);

    return () => controller.abort();
  }, [loadMentors, reloadKey]);

  function openNewMentor() {
    setEditingMentor(undefined);
    setEditorOpen(true);
  }

  function openMentor(mentor: MentorRecord) {
    setEditingMentor(mentor);
    setEditorOpen(true);
  }

  async function togglePublished(mentor: MentorRecord) {
    setBusyId(mentor.id);

    try {
      const response = await fetch(`/api/admin/mentors/${mentor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !mentor.isPublished }),
      });

      if (!response.ok) {
        throw new Error("Unable to update mentor status.");
      }

      setReloadKey((current) => current + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update mentor status."
      );
    } finally {
      setBusyId("");
    }
  }

  async function deleteMentor() {
    if (!deletingMentor) {
      return;
    }

    setBusyId(deletingMentor.id);

    try {
      const response = await fetch(`/api/admin/mentors/${deletingMentor.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete mentor.");
      }

      setDeletingMentor(undefined);
      setReloadKey((current) => current + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete mentor."
      );
    } finally {
      setBusyId("");
    }
  }

  async function moveMentor(mentorId: string, direction: -1 | 1) {
    setBusyId(mentorId);

    try {
      const allIds = await loadAllMentorIds();
      const currentIndex = allIds.indexOf(mentorId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= allIds.length) {
        return;
      }

      [allIds[currentIndex], allIds[nextIndex]] = [
        allIds[nextIndex],
        allIds[currentIndex],
      ];

      const response = await fetch("/api/admin/mentors/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: allIds }),
      });

      if (!response.ok) {
        throw new Error("Unable to reorder mentors.");
      }

      setReloadKey((current) => current + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reorder mentors."
      );
    } finally {
      setBusyId("");
    }
  }

  async function loadAllMentorIds() {
    const firstPage = await fetchMentorPage(1);
    const ids = firstPage.mentors.map((mentor) => mentor.id);

    for (
      let pageNumber = 2;
      pageNumber <= firstPage.pagination.totalPages;
      pageNumber += 1
    ) {
      const nextPage = await fetchMentorPage(pageNumber);
      ids.push(...nextPage.mentors.map((mentor) => mentor.id));
    }

    return ids;
  }

  async function fetchMentorPage(pageNumber: number) {
    const params = new URLSearchParams({
      page: String(pageNumber),
      limit: "100",
    });
    const response = await fetch(`/api/admin/mentors?${params}`);
    const result = (await response.json()) as {
      error?: string;
      data?: { mentors?: MentorRecord[]; pagination?: Pagination };
    };

    if (!response.ok || !result.data?.pagination) {
      throw new Error(result.error ?? "Unable to load mentor order.");
    }

    return {
      mentors: result.data.mentors ?? [],
      pagination: result.data.pagination,
    };
  }

  function setPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Mentors
          </h1>
          <p className="mt-2 text-base text-muted">
            Manage the faculty displayed on the public site.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewMentor}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-cream hover:bg-primary-dark"
        >
          <Plus size={16} />
          Add mentor
        </button>
      </header>

      <MentorsFilter />

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <TableRowsSkeleton
            rows={8}
            columns={6}
            widths={["w-10", "w-3/4", "w-5/6", "w-1/2", "w-2/3", "w-1/3"]}
          />
        ) : mentors.length === 0 ? (
          <div className="p-10 text-center">
            <Users
              aria-hidden="true"
              className="mx-auto text-muted"
              size={36}
            />
            <p className="mt-3 text-sm text-muted">No mentors yet.</p>
            <button
              type="button"
              onClick={openNewMentor}
              className="mt-4 cursor-pointer text-sm font-medium text-accent hover:underline"
            >
              Add your first mentor
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-medium">Photo</th>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Specializations</th>
                    <th className="px-5 py-3 font-medium">Experience</th>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mentors.map((mentor) => (
                    <tr
                      key={mentor.id}
                      className="border-b border-border last:border-0 hover:bg-primary/[0.025]"
                    >
                      <td className="px-5 py-3">
                        <Image
                          src={mentor.photoUrl}
                          alt=""
                          width={32}
                          height={32}
                          unoptimized
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => openMentor(mentor)}
                          className="cursor-pointer text-left"
                        >
                          <span className="block text-sm font-medium text-primary">
                            {mentor.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {mentor.title}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <Specializations mentor={mentor} />
                      </td>
                      <td className="px-5 py-3 text-sm text-foreground">
                        {mentor.yearsOfExperience} years
                      </td>
                      <td className="px-5 py-3 text-sm text-muted">
                        {mentor.order}
                      </td>
                      <td className="px-5 py-3">
                        <MentorStatus published={mentor.isPublished} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <MentorActions
                          mentor={mentor}
                          busy={busyId === mentor.id}
                          onEdit={openMentor}
                          onToggle={() => void togglePublished(mentor)}
                          onMove={moveMentor}
                          onDelete={() => setDeletingMentor(mentor)}
                          onConfirmDelete={deleteMentor}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border md:hidden">
              {mentors.map((mentor) => (
                <article key={mentor.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Image
                      src={mentor.photoUrl}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => openMentor(mentor)}
                        className="cursor-pointer text-left"
                      >
                        <span className="block truncate text-sm font-medium text-primary">
                          {mentor.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {mentor.title}
                        </span>
                      </button>
                      <div className="mt-3">
                        <Specializations mentor={mentor} />
                      </div>
                    </div>
                    <MentorActions
                      mentor={mentor}
                      busy={busyId === mentor.id}
                      onEdit={openMentor}
                      onToggle={() => void togglePublished(mentor)}
                      onMove={moveMentor}
                      onDelete={() => setDeletingMentor(mentor)}
                      onConfirmDelete={deleteMentor}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted">
                      {mentor.yearsOfExperience} years experience · Order{" "}
                      {mentor.order}
                    </span>
                    <MentorStatus published={mentor.isPublished} />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={setPage}
      />

      <MentorEditor
        mentor={editingMentor}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSaved={() => setReloadKey((current) => current + 1)}
      />

      {deletingMentor ? (
        <div className="sr-only" aria-live="polite">
          Delete confirmation for {deletingMentor.name}
        </div>
      ) : null}
    </div>
  );
}

function Specializations({ mentor }: { mentor: MentorRecord }) {
  const shown = mentor.specializations.slice(0, 2);
  const remaining = mentor.specializations.length - shown.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((item) => (
        <Badge key={item} className="px-2 py-1 text-[10px] text-muted">
          {item}
        </Badge>
      ))}
      {remaining > 0 ? (
        <Badge className="px-2 py-1 text-[10px] text-muted">+{remaining}</Badge>
      ) : null}
    </div>
  );
}

function MentorStatus({ published }: { published: boolean }) {
  return (
    <Badge
      className={
        published
          ? "border-emerald-600/30 text-emerald-700"
          : "border-border text-muted"
      }
    >
      {published ? "Published" : "Draft"}
    </Badge>
  );
}

function MentorActions({
  mentor,
  busy,
  onEdit,
  onToggle,
  onMove,
  onDelete,
  onConfirmDelete,
}: {
  mentor: MentorRecord;
  busy: boolean;
  onEdit: (mentor: MentorRecord) => void;
  onToggle: () => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
}) {
  return (
    <AlertDialog>
      <DropdownMenu closeOnOutsideClick>
        <DropdownMenuTrigger>
          <button
            type="button"
            aria-label={`Actions for ${mentor.name}`}
            disabled={busy}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed"
          >
            <MoreHorizontal size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48">
          <DropdownMenuItem onClick={() => onEdit(mentor)}>
            <Pencil size={14} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggle}>
            {mentor.isPublished ? <EyeOff size={14} /> : <Globe size={14} />}
            {mentor.isPublished ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={busy}
            onClick={() => onMove(mentor.id, -1)}
          >
            <span className="inline-flex items-center gap-2">
              <ArrowUp size={14} />
              Move up
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={busy}
            onClick={() => onMove(mentor.id, 1)}
          >
            <span className="inline-flex items-center gap-2">
              <ArrowDown size={14} />
              Move down
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger>
            <DropdownMenuItem onClick={onDelete} destructive>
              <Trash2 size={14} />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this mentor?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove {mentor.name} from the public site and delete their
            photo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <X size={14} />
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmDelete}>
            <Trash2 size={14} />
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
