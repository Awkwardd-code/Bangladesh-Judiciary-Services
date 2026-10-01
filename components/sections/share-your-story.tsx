"use client";

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Quote,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type StoryForm = {
  authorName: string;
  authorEmail: string;
  authorUniversity: string;
  authorBatch: string;
  yearOfSelection: string;
  achievement: string;
  quote: string;
  fullStory: string;
  authorPhotoUrl: string | null;
  authorPhotoPublicId: string | null;
};

const emptyForm: StoryForm = {
  authorName: "",
  authorEmail: "",
  authorUniversity: "",
  authorBatch: "",
  yearOfSelection: "",
  achievement: "",
  quote: "",
  fullStory: "",
  authorPhotoUrl: null,
  authorPhotoPublicId: null,
};

const includeItems = [
  "Your name and university",
  "Your batch and year of selection",
  "A short quote about your preparation",
  "Optionally, a longer write-up",
];

export function ShareYourStory() {
  const [form, setForm] = useState<StoryForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    form.authorEmail.trim(),
  );
  const formValid =
    form.authorName.trim().length >= 2 &&
    emailValid &&
    form.authorUniversity.trim().length >= 2 &&
    form.authorBatch.trim().length >= 1 &&
    form.achievement.trim().length >= 2 &&
    form.quote.trim().length >= 10 &&
    (!form.yearOfSelection ||
      (/^\d{4}$/.test(form.yearOfSelection) &&
        Number(form.yearOfSelection) >= 1990 &&
        Number(form.yearOfSelection) <= 2100));

  function update<Key extends keyof StoryForm>(
    key: Key,
    value: StoryForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setForm({ ...emptyForm });
    setError(null);
    setSuccess(false);
    setAttempted(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    setError(null);

    if (
      !form.authorName.trim() ||
      !form.authorEmail.trim() ||
      !form.authorUniversity.trim() ||
      !form.authorBatch.trim() ||
      !form.achievement.trim() ||
      !form.quote.trim()
    ) {
      setError("Complete all required fields before submitting.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.authorEmail.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (form.quote.trim().length < 10) {
      setError("Your quote must be at least 10 characters.");
      return;
    }

    if (form.achievement.trim().length < 2) {
      setError("Achievement must be at least 2 characters.");
      return;
    }

    if (form.yearOfSelection) {
      const year = Number(form.yearOfSelection);

      if (!/^\d{4}$/.test(form.yearOfSelection) || year < 1990 || year > 2100) {
        setError("Enter a four-digit selection year between 1990 and 2100.");
        return;
      }
    }

    setLoading(true);

    const payload = {
      authorName: form.authorName.trim(),
      authorEmail: form.authorEmail.trim(),
      authorUniversity: form.authorUniversity.trim(),
      authorBatch: form.authorBatch.trim(),
      achievement: form.achievement.trim(),
      quote: form.quote.trim(),
      fullStory: form.fullStory.trim() || undefined,
      yearOfSelection: form.yearOfSelection
        ? Number(form.yearOfSelection)
        : undefined,
      authorPhotoUrl: form.authorPhotoUrl || undefined,
      authorPhotoPublicId: form.authorPhotoPublicId || undefined,
    };

    try {
      const response = await fetch("/api/success-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };

      if (response.status !== 201) {
        throw new Error(result.error ?? "Unable to submit your story.");
      }

      setSuccess(true);
      setForm({ ...emptyForm });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to submit your story. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-t border-border bg-cream px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              YOUR STORY
            </p>
            <h2 className="mt-4 max-w-md font-heading text-3xl font-bold leading-tight text-primary lg:text-4xl">
              Did you clear the exam? Share your journey.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-muted">
              Your story could be the reason someone else keeps going. Submit it
              and we&apos;ll review it before publishing.
            </p>

            <div className="mt-8">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.2em] text-primary">
                WHAT TO INCLUDE
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {includeItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      aria-hidden="true"
                      size={16}
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    <span className="text-sm leading-6 text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 rounded-lg border border-border bg-card p-6 shadow-sm">
              {
                // PLACEHOLDER — replace with real data.
              }
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                STORIES ON THIS PLATFORM
              </p>
              <div className="mt-4 grid grid-cols-2 gap-6">
                <div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    120+
                  </p>
                  <p className="mt-1 text-xs text-muted">Students featured</p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    45+
                  </p>
                  <p className="mt-1 text-xs text-muted">Judicial selections</p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    12
                  </p>
                  <p className="mt-1 text-xs text-muted">Years of mentorship</p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    60+
                  </p>
                  <p className="mt-1 text-xs text-muted">Success stories</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-border bg-primary/5 p-6">
              {
                // PLACEHOLDER — replace before launch.
              }
              <Quote className="text-3xl text-accent" strokeWidth={1.5} />
              <p className="mt-2 text-[15px] leading-7 text-foreground">
                &ldquo;BJS Prep helped me understand that the exam was about
                reasoning, not memorisation.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-cream">
                  SR
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-primary">
                    Sadia Rahman
                  </p>
                  <p className="text-[12px] text-muted">
                    University of Dhaka · Batch 2019-20
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-2">
              <Lock aria-hidden="true" size={14} className="mt-0.5 text-muted" />
              <p className="text-[13px] leading-6 text-muted">
                We never publish your email address. Only your name, university,
                and the content you submit.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card className="border border-border bg-card p-6 shadow-sm lg:p-8">
              {success ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2
                    aria-hidden="true"
                    size={48}
                    className="mx-auto text-accent"
                  />
                  <h3 className="mt-6 text-center font-heading text-xl font-bold text-primary">
                    Thank you.
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-center text-[15px] leading-7 text-muted">
                    Your story has been submitted for review. We&apos;ll publish it
                    once approved.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={reset}
                      className="h-10 cursor-pointer rounded-md px-4 text-sm text-muted transition-colors hover:bg-primary/5 hover:text-primary"
                    >
                      Submit another story
                    </button>
                    <Link
                      href="/success-stories"
                      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-4 text-sm text-primary transition-colors hover:bg-primary/5"
                    >
                      Back to stories
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-6">
                  <header>
                    <h3 className="font-heading text-xl font-semibold text-primary">
                      Submit your story
                    </h3>
                    <p className="mt-1 text-[13px] text-muted">
                      All fields marked with * are required.
                    </p>
                  </header>

                  <section className="rounded-md border border-dashed border-border bg-background p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <ImageUploader
                        value={form.authorPhotoUrl}
                        publicId={form.authorPhotoPublicId}
                        onChange={(image) => {
                          update("authorPhotoUrl", image.url);
                          update("authorPhotoPublicId", image.publicId);
                        }}
                        folder="bjs-prep/success-stories"
                        aspect="square"
                        size={96}
                      />

                      <div>
                        <p className="text-sm font-semibold text-primary">
                          Your photo (optional)
                        </p>
                        <p className="mt-1 text-[13px] leading-6 text-muted">
                          A clear photo helps readers connect with your story.
                          JPEG, PNG, or WebP. Max 5 MB.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-primary">
                        ABOUT YOU
                      </p>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <Field
                        id="story-author-name"
                        label="Full name *"
                        required
                        autoComplete="name"
                        maxLength={120}
                        value={form.authorName}
                        error={
                          attempted && form.authorName.trim().length < 2
                            ? "Enter at least 2 characters."
                            : undefined
                        }
                        onChange={(value) => update("authorName", value)}
                      />
                      <Field
                        id="story-author-email"
                        label="Email *"
                        required
                        type="email"
                        autoComplete="email"
                        value={form.authorEmail}
                        error={
                          attempted && !emailValid
                            ? "Enter a valid email address."
                            : undefined
                        }
                        onChange={(value) => update("authorEmail", value)}
                      />
                      <Field
                        id="story-university"
                        label="University *"
                        required
                        maxLength={160}
                        value={form.authorUniversity}
                        error={
                          attempted && form.authorUniversity.trim().length < 2
                            ? "Enter at least 2 characters."
                            : undefined
                        }
                        onChange={(value) => update("authorUniversity", value)}
                      />
                      <Field
                        id="story-batch"
                        label="Batch *"
                        required
                        maxLength={40}
                        placeholder="e.g. 2019-20"
                        value={form.authorBatch}
                        error={
                          attempted && !form.authorBatch.trim()
                            ? "Batch is required."
                            : undefined
                        }
                        onChange={(value) => update("authorBatch", value)}
                      />
                      <Field
                        id="story-selection-year"
                        label="Year of selection"
                        type="number"
                        min={1990}
                        max={2100}
                        placeholder="e.g. 2024"
                        value={form.yearOfSelection}
                        error={
                          attempted &&
                          Boolean(form.yearOfSelection) &&
                          !/^\d{4}$/.test(form.yearOfSelection)
                            ? "Enter a four-digit year."
                            : undefined
                        }
                        onChange={(value) => update("yearOfSelection", value)}
                      />
                      <Field
                        id="story-achievement"
                        label="Achievement *"
                        required
                        maxLength={200}
                        placeholder="e.g. Selected as Assistant Judge"
                        value={form.achievement}
                        error={
                          attempted && form.achievement.trim().length < 2
                            ? "Enter at least 2 characters."
                            : undefined
                        }
                        onChange={(value) => update("achievement", value)}
                      />
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-primary">
                        YOUR STORY
                      </p>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="mt-5 flex flex-col gap-5">
                      <label
                        htmlFor="story-quote"
                        className="block text-sm font-medium text-foreground"
                      >
                        <span className="flex items-center justify-between gap-4">
                          <span>Short quote *</span>
                          <span className="text-[11px] text-muted">
                            {form.quote.length} / 500
                          </span>
                        </span>
                        <Textarea
                          id="story-quote"
                          required
                          rows={4}
                          maxLength={500}
                          value={form.quote}
                          onBlur={() => {
                            if (form.quote.trim().length < 10) {
                              setAttempted(true);
                            }
                          }}
                          onChange={(event) => update("quote", event.target.value)}
                          className="mt-2"
                        />
                        {attempted && form.quote.trim().length < 10 ? (
                          <span className="mt-1 block text-xs text-red-600">
                            Quote must be at least 10 characters.
                          </span>
                        ) : null}
                      </label>

                      <label
                        htmlFor="story-full-story"
                        className="block text-sm font-medium text-foreground"
                      >
                        <span className="flex items-center justify-between gap-4">
                          <span>Full story (optional)</span>
                          <span className="text-[11px] text-muted">
                            {form.fullStory.length} / 5000
                          </span>
                        </span>
                        <Textarea
                          id="story-full-story"
                          rows={8}
                          maxLength={5000}
                          value={form.fullStory}
                          onChange={(event) =>
                            update("fullStory", event.target.value)
                          }
                          className="mt-2"
                        />
                      </label>
                    </div>
                  </section>

                  {error ? (
                    <div
                      role="alert"
                      className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading || !formValid}
                    className="mt-2 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary text-cream transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center justify-center gap-2 font-medium">
                        <Loader2 size={17} className="animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 font-medium">
                        <Send size={16} />
                        Submit story
                      </span>
                    )}
                  </button>

                  <p className="text-center text-[11px] leading-5 text-muted">
                    By submitting, you agree that we may publish your story with
                    your name and university.
                  </p>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  ...inputProps
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "id" | "value" | "onChange"
>) {
  return (
    <label htmlFor={id} className="block text-sm font-medium text-foreground">
      <span className="mb-2 block">{label}</span>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md"
        {...inputProps}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : null}
    </label>
  );
}
