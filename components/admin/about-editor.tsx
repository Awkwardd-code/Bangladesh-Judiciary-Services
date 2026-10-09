"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Compass,
  Eye,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  MessageSquare,
  RotateCcw,
  Save,
  Scale,
  Sparkles,
  Target,
  Trophy,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AboutPreviewPanel } from "@/components/admin/about-preview-panel";
import { Input } from "@/components/ui/input";
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
import { toast } from "@/components/ui/toaster";
import type { AboutPillar, AboutShape } from "@/lib/types/about";

type AboutSection =
  "hero" | "mission" | "approach" | "why" | "faculty" | "stats";

type AboutEditorProps = {
  initialAbout: AboutShape | null;
  defaults: AboutShape;
};

const sections: { id: AboutSection; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "mission", label: "Mission" },
  { id: "approach", label: "Approach" },
  { id: "why", label: "Why" },
  { id: "faculty", label: "Faculty" },
  { id: "stats", label: "Stats" },
];

const iconOptions: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: "book-open", label: "Book open", Icon: BookOpen },
  { name: "file-text", label: "File text", Icon: FileText },
  { name: "clipboard-check", label: "Clipboard check", Icon: ClipboardCheck },
  { name: "users", label: "Users", Icon: Users },
  { name: "scale", label: "Scale", Icon: Scale },
  { name: "target", label: "Target", Icon: Target },
  { name: "compass", label: "Compass", Icon: Compass },
  { name: "bar-chart-3", label: "Bar chart", Icon: BarChart3 },
  { name: "message-square", label: "Message", Icon: MessageSquare },
  { name: "award", label: "Award", Icon: Award },
  { name: "trophy", label: "Trophy", Icon: Trophy },
  { name: "briefcase", label: "Briefcase", Icon: Briefcase },
  { name: "graduation-cap", label: "Graduation cap", Icon: GraduationCap },
  { name: "layers", label: "Layers", Icon: Layers },
  { name: "sparkles", label: "Sparkles", Icon: Sparkles },
];

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  [nextItems[index], nextItems[targetIndex]] = [
    nextItems[targetIndex],
    nextItems[index],
  ];
  return nextItems;
}

function SectionCard({
  id,
  title,
  description,
  children,
}: {
  id: AboutSection;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="mb-6">
        <h2 className="font-heading text-lg font-semibold text-primary">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  helper,
  value,
  maxLength,
  children,
}: {
  label: string;
  helper?: string;
  value?: string;
  maxLength?: number;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-primary">{label}</span>
        {typeof value === "string" && maxLength ? (
          <span className="text-xs text-muted">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
      {children}
      {helper ? <p className="mt-1.5 text-xs text-muted">{helper}</p> : null}
    </label>
  );
}

function IconForName({ name }: { name: string }) {
  const option = iconOptions.find((item) => item.name === name);
  const Icon = option?.Icon ?? BookOpen;

  return <Icon aria-hidden="true" size={16} />;
}

export function AboutEditor({ initialAbout, defaults }: AboutEditorProps) {
  const initialForm = initialAbout ?? defaults;
  const [form, setForm] = useState<AboutShape>(initialForm);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initialForm));
  const [initialized, setInitialized] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forceDirty, setForceDirty] = useState(false);
  const [activeSection, setActiveSection] = useState<AboutSection>("hero");
  const [previewOpen, setPreviewOpen] = useState(false);
  const dirty = forceDirty || JSON.stringify(form) !== baseline;
  const serializedForm = useMemo(() => JSON.stringify(form), [form]);

  useEffect(() => {
    const nextForm = initialAbout ?? defaults;
    setForm(nextForm);
    setBaseline(JSON.stringify(nextForm));
    setForceDirty(false);
    setInitialized(true);
  }, [initialAbout, defaults]);

  useEffect(() => {
    if (!dirty) {
      return;
    }

    function preventUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [dirty]);

  function updateField<Key extends keyof AboutShape>(
    key: Key,
    value: AboutShape[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setForceDirty(false);
    setError(null);
    setSuccessMessage(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: serializedForm,
      });
      const result = (await response.json()) as {
        error?: string;
        data?: { about?: AboutShape };
      };

      if (!response.ok || !result.data?.about) {
        throw new Error(result.error ?? "Unable to save the About page.");
      }

      const savedForm = result.data.about;
      setForm(savedForm);
      setBaseline(JSON.stringify(savedForm));
      setForceDirty(false);
      setSuccessMessage("About page saved.");
      toast("About page saved.");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save the About page.";
      setError(message);
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  function resetToDefaults() {
    setForm(defaults);
    setForceDirty(true);
    setError(null);
    setSuccessMessage(null);
  }

  if (!initialized) {
    return null;
  }

  return (
    <div>
      <header
        className="
          sticky top-0 z-30 flex flex-col gap-4 border-b border-border
          bg-background px-6 py-4 xl:flex-row xl:items-center
          xl:justify-between
        "
      >
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">
            About page
          </h1>
          <p className="mt-1 text-sm text-muted">
            Edit the content shown on the public About page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dirty ? (
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">
              Unsaved changes
            </span>
          ) : null}
          <AlertDialog>
            <AlertDialogTrigger>
              <button
                type="button"
                className="
                  inline-flex h-10 cursor-pointer items-center gap-2 rounded-md
                  border border-border bg-card px-3 text-sm text-primary
                "
              >
                <RotateCcw size={16} />
                Reset to defaults
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will replace all fields with the original content. Your
                  changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetToDefaults}>
                  Reset content
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <a
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex h-10 cursor-pointer items-center gap-2 rounded-md
              border border-border bg-card px-3 text-sm text-primary
            "
          >
            <Eye size={16} />
            Preview page
          </a>
          <button
            type="button"
            onClick={() => setPreviewOpen((current) => !current)}
            aria-pressed={previewOpen}
            className="
              inline-flex h-10 cursor-pointer items-center gap-2 rounded-md
              border border-border bg-card px-3 text-sm text-primary
            "
          >
            <Eye size={16} />
            {previewOpen ? "Hide live preview" : "Live preview"}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !dirty}
            className="
              inline-flex h-10 cursor-pointer items-center gap-2 rounded-md
              bg-primary px-4 text-sm font-medium text-cream
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </header>

      {error || successMessage ? (
        <div className="px-6 pt-5">
          {error ? (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          ) : (
            <p
              role="status"
              className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              {successMessage}
            </p>
          )}
        </div>
      ) : null}

      <div
        className={`
          grid gap-8 px-6 py-8
          ${previewOpen ? "xl:grid-cols-[minmax(0,7fr)_minmax(320px,5fr)]" : "xl:grid-cols-[260px_1fr]"}
        `}
      >
        <nav
          aria-label="About page sections"
          className={
            previewOpen
              ? "flex flex-wrap gap-1 xl:col-span-2"
              : "sticky top-24 hidden h-fit space-y-1 self-start xl:block"
          }
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setActiveSection(section.id)}
              className={`
                block cursor-pointer border-l-2 px-4 py-2.5 text-sm
                ${activeSection === section.id ? "border-accent bg-primary/5 font-medium text-primary" : "border-transparent text-muted hover:bg-primary/5 hover:text-primary"}
              `}
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div
          className={`
            min-w-0 space-y-6
            ${previewOpen ? "xl:col-span-1" : ""}
          `}
        >
          <SectionCard
            id="hero"
            title="Hero"
            description="The first thing visitors see."
          >
            <Field
              label="Kicker"
              helper="A short label above the main heading."
              value={form.heroKicker}
              maxLength={80}
            >
              <Input
                maxLength={80}
                value={form.heroKicker}
                onChange={(event) =>
                  updateField("heroKicker", event.target.value)
                }
              />
            </Field>
            <Field label="Title" value={form.heroTitle} maxLength={300}>
              <Input
                maxLength={300}
                value={form.heroTitle}
                onChange={(event) =>
                  updateField("heroTitle", event.target.value)
                }
              />
            </Field>
            <Field label="Subtitle" value={form.heroSubtitle} maxLength={500}>
              <Textarea
                rows={3}
                maxLength={500}
                value={form.heroSubtitle}
                onChange={(event) =>
                  updateField("heroSubtitle", event.target.value)
                }
              />
            </Field>
          </SectionCard>

          <SectionCard id="mission" title="Mission">
            <Field label="Kicker" value={form.missionKicker} maxLength={80}>
              <Input
                maxLength={80}
                value={form.missionKicker}
                onChange={(event) =>
                  updateField("missionKicker", event.target.value)
                }
              />
            </Field>
            <Field label="Title" value={form.missionTitle} maxLength={300}>
              <Input
                maxLength={300}
                value={form.missionTitle}
                onChange={(event) =>
                  updateField("missionTitle", event.target.value)
                }
              />
            </Field>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">Paragraphs</p>
                <p className="text-xs text-muted">
                  {form.missionParagraphs.length}/6
                </p>
              </div>
              {form.missionParagraphs.map((paragraph, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border p-4"
                >
                  <Field
                    label={`Paragraph ${index + 1}`}
                    value={paragraph}
                    maxLength={2000}
                  >
                    <Textarea
                      rows={4}
                      maxLength={2000}
                      value={paragraph}
                      onChange={(event) =>
                        updateField(
                          "missionParagraphs",
                          form.missionParagraphs.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item
                          )
                        )
                      }
                    />
                  </Field>
                  <div className="mt-3 flex justify-end gap-2">
                    <ReorderButton
                      label="Move paragraph up"
                      direction="up"
                      disabled={index === 0}
                      onClick={() =>
                        updateField(
                          "missionParagraphs",
                          moveItem(form.missionParagraphs, index, -1)
                        )
                      }
                    />
                    <ReorderButton
                      label="Move paragraph down"
                      direction="down"
                      disabled={index === form.missionParagraphs.length - 1}
                      onClick={() =>
                        updateField(
                          "missionParagraphs",
                          moveItem(form.missionParagraphs, index, 1)
                        )
                      }
                    />
                    <RemoveButton
                      label="Remove paragraph"
                      disabled={form.missionParagraphs.length <= 1}
                      onClick={() =>
                        updateField(
                          "missionParagraphs",
                          form.missionParagraphs.filter(
                            (_, itemIndex) => itemIndex !== index
                          )
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                disabled={form.missionParagraphs.length >= 6}
                onClick={() =>
                  updateField("missionParagraphs", [
                    ...form.missionParagraphs,
                    "",
                  ])
                }
                className="
                  cursor-pointer text-sm font-medium text-accent
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                + Add paragraph
              </button>
            </div>
          </SectionCard>

          <SectionCard id="approach" title="Approach">
            <Field label="Kicker" value={form.approachKicker} maxLength={80}>
              <Input
                maxLength={80}
                value={form.approachKicker}
                onChange={(event) =>
                  updateField("approachKicker", event.target.value)
                }
              />
            </Field>
            <Field label="Title" value={form.approachTitle} maxLength={300}>
              <Input
                maxLength={300}
                value={form.approachTitle}
                onChange={(event) =>
                  updateField("approachTitle", event.target.value)
                }
              />
            </Field>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">Pillars</p>
                <p className="text-xs text-muted">
                  {form.approachPillars.length}/8
                </p>
              </div>
              {form.approachPillars.map((pillar, index) => (
                <PillarEditor
                  key={index}
                  pillar={pillar}
                  index={index}
                  count={form.approachPillars.length}
                  onChange={(nextPillar) =>
                    updateField(
                      "approachPillars",
                      form.approachPillars.map((item, itemIndex) =>
                        itemIndex === index ? nextPillar : item
                      )
                    )
                  }
                  onMove={(direction) =>
                    updateField(
                      "approachPillars",
                      moveItem(form.approachPillars, index, direction)
                    )
                  }
                  onRemove={() =>
                    updateField(
                      "approachPillars",
                      form.approachPillars.filter(
                        (_, itemIndex) => itemIndex !== index
                      )
                    )
                  }
                />
              ))}
              <button
                type="button"
                disabled={form.approachPillars.length >= 8}
                onClick={() =>
                  updateField("approachPillars", [
                    ...form.approachPillars,
                    {
                      title: "",
                      description: "",
                      iconName: "book-open",
                    },
                  ])
                }
                className="
                  cursor-pointer text-sm font-medium text-accent
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                + Add pillar
              </button>
            </div>
          </SectionCard>

          <SectionCard id="why" title="Why">
            <Field label="Kicker" value={form.whyKicker} maxLength={80}>
              <Input
                maxLength={80}
                value={form.whyKicker}
                onChange={(event) =>
                  updateField("whyKicker", event.target.value)
                }
              />
            </Field>
            <Field label="Title" value={form.whyTitle} maxLength={300}>
              <Input
                maxLength={300}
                value={form.whyTitle}
                onChange={(event) =>
                  updateField("whyTitle", event.target.value)
                }
              />
            </Field>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">
                  Comparison rows
                </p>
                <p className="text-xs text-muted">
                  {form.whyComparisonRows.length}/12
                </p>
              </div>
              {form.whyComparisonRows.map((row, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Scattered preparation"
                      value={row.scattered}
                      maxLength={300}
                    >
                      <Input
                        maxLength={300}
                        value={row.scattered}
                        onChange={(event) =>
                          updateField(
                            "whyComparisonRows",
                            form.whyComparisonRows.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, scattered: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </Field>
                    <Field label="BJS Prep" value={row.bjsPrep} maxLength={300}>
                      <Input
                        maxLength={300}
                        value={row.bjsPrep}
                        onChange={(event) =>
                          updateField(
                            "whyComparisonRows",
                            form.whyComparisonRows.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, bjsPrep: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </Field>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <ReorderButton
                      label="Move comparison row up"
                      direction="up"
                      disabled={index === 0}
                      onClick={() =>
                        updateField(
                          "whyComparisonRows",
                          moveItem(form.whyComparisonRows, index, -1)
                        )
                      }
                    />
                    <ReorderButton
                      label="Move comparison row down"
                      direction="down"
                      disabled={index === form.whyComparisonRows.length - 1}
                      onClick={() =>
                        updateField(
                          "whyComparisonRows",
                          moveItem(form.whyComparisonRows, index, 1)
                        )
                      }
                    />
                    <RemoveButton
                      label="Remove comparison row"
                      disabled={form.whyComparisonRows.length <= 1}
                      onClick={() =>
                        updateField(
                          "whyComparisonRows",
                          form.whyComparisonRows.filter(
                            (_, itemIndex) => itemIndex !== index
                          )
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                disabled={form.whyComparisonRows.length >= 12}
                onClick={() =>
                  updateField("whyComparisonRows", [
                    ...form.whyComparisonRows,
                    { scattered: "", bjsPrep: "" },
                  ])
                }
                className="
                  cursor-pointer text-sm font-medium text-accent
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                + Add comparison row
              </button>
            </div>
          </SectionCard>

          <SectionCard id="faculty" title="Faculty">
            <Field label="Kicker" value={form.facultyKicker} maxLength={80}>
              <Input
                maxLength={80}
                value={form.facultyKicker}
                onChange={(event) =>
                  updateField("facultyKicker", event.target.value)
                }
              />
            </Field>
            <Field label="Title" value={form.facultyTitle} maxLength={300}>
              <Input
                maxLength={300}
                value={form.facultyTitle}
                onChange={(event) =>
                  updateField("facultyTitle", event.target.value)
                }
              />
            </Field>
          </SectionCard>

          <SectionCard id="stats" title="Stats">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">
                  Public statistics
                </p>
                <p className="text-xs text-muted">{form.stats.length}/8</p>
              </div>
              {form.stats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                    <Field label="Label" value={stat.label} maxLength={80}>
                      <Input
                        maxLength={80}
                        value={stat.label}
                        onChange={(event) =>
                          updateField(
                            "stats",
                            form.stats.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, label: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </Field>
                    <Field label="Value" value={stat.value} maxLength={40}>
                      <Input
                        maxLength={40}
                        value={stat.value}
                        onChange={(event) =>
                          updateField(
                            "stats",
                            form.stats.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, value: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </Field>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <ReorderButton
                      label="Move stat up"
                      direction="up"
                      disabled={index === 0}
                      onClick={() =>
                        updateField("stats", moveItem(form.stats, index, -1))
                      }
                    />
                    <ReorderButton
                      label="Move stat down"
                      direction="down"
                      disabled={index === form.stats.length - 1}
                      onClick={() =>
                        updateField("stats", moveItem(form.stats, index, 1))
                      }
                    />
                    <RemoveButton
                      label="Remove stat"
                      onClick={() =>
                        updateField(
                          "stats",
                          form.stats.filter(
                            (_, itemIndex) => itemIndex !== index
                          )
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                disabled={form.stats.length >= 8}
                onClick={() =>
                  updateField("stats", [
                    ...form.stats,
                    { label: "", value: "" },
                  ])
                }
                className="
                  cursor-pointer text-sm font-medium text-accent
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                + Add stat
              </button>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || !dirty}
              className="
                inline-flex h-11 cursor-pointer items-center gap-2 rounded-md
                bg-primary px-5 text-sm font-medium text-cream
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              <Save size={16} />
              Save changes
            </button>
          </div>
        </div>

        {previewOpen ? (
          <div className="xl:col-span-1">
            <AboutPreviewPanel form={form} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReorderButton({
  label,
  direction,
  disabled,
  onClick,
}: {
  label: string;
  direction: "up" | "down";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="
        inline-flex h-9 w-9 cursor-pointer items-center justify-center
        rounded-md border border-border text-muted
        hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40
      "
    >
      <Icon size={16} />
    </button>
  );
}

function RemoveButton({
  label,
  disabled = false,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="
        inline-flex h-9 w-9 cursor-pointer items-center justify-center
        rounded-md border border-red-200 text-red-600 hover:bg-red-50
        disabled:cursor-not-allowed disabled:opacity-40
      "
    >
      <Trash2 size={15} />
    </button>
  );
}

function PillarEditor({
  pillar,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  pillar: AboutPillar;
  index: number;
  count: number;
  onChange: (pillar: AboutPillar) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [iconOpen, setIconOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary">Pillar {index + 1}</p>
        <div className="flex gap-2">
          <ReorderButton
            label="Move pillar up"
            direction="up"
            disabled={index === 0}
            onClick={() => onMove(-1)}
          />
          <ReorderButton
            label="Move pillar down"
            direction="down"
            disabled={index === count - 1}
            onClick={() => onMove(1)}
          />
          <RemoveButton
            label="Remove pillar"
            disabled={count <= 1}
            onClick={onRemove}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Title" value={pillar.title} maxLength={120}>
          <Input
            maxLength={120}
            value={pillar.title}
            onChange={(event) =>
              onChange({ ...pillar, title: event.target.value })
            }
          />
        </Field>
        <Field label="Description" value={pillar.description} maxLength={500}>
          <Textarea
            rows={3}
            maxLength={500}
            value={pillar.description}
            onChange={(event) =>
              onChange({ ...pillar, description: event.target.value })
            }
          />
        </Field>
        <Field label="Icon">
          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={iconOpen}
              onClick={() => setIconOpen((current) => !current)}
              className="
                inline-flex h-11 w-full cursor-pointer items-center gap-2
                rounded-md border border-border bg-card px-3 text-sm
                text-primary outline-none focus:border-accent
              "
            >
              <IconForName name={pillar.iconName} />
              <span className="flex-1 text-left">
                {iconOptions.find((option) => option.name === pillar.iconName)
                  ?.label ?? "Book open"}
              </span>
              <ChevronDown size={16} />
            </button>
            {iconOpen ? (
              <div
                role="listbox"
                aria-label="Choose pillar icon"
                className="
                  absolute z-20 mt-1 grid max-h-60 w-full grid-cols-2 gap-1
                  overflow-y-auto rounded-md border border-border bg-card p-2
                  shadow-lg
                "
              >
                {iconOptions.map(({ name, label, Icon }) => (
                  <button
                    key={name}
                    type="button"
                    role="option"
                    aria-selected={pillar.iconName === name}
                    onClick={() => {
                      onChange({ ...pillar, iconName: name });
                      setIconOpen(false);
                    }}
                    className="
                      inline-flex cursor-pointer items-center gap-2 rounded-md
                      px-2 py-2 text-left text-xs text-primary
                      hover:bg-primary/5
                    "
                  >
                    <Icon aria-hidden="true" size={16} />
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </Field>
      </div>
    </div>
  );
}
