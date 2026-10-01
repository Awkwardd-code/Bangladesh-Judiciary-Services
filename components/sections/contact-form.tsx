"use client";

import { CheckCircle2, Loader2, RotateCcw, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const formValid =
    name.trim().length >= 2 &&
    emailValid &&
    subject.trim().length >= 3 &&
    message.trim().length >= 10;

  function resetForm() {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setError(null);
    setSuccess(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError("Please complete every field.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (subject.trim().length < 3 || message.trim().length < 10) {
      setError("Subject must be at least 3 characters and message at least 10.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (response.status !== 201) {
        throw new Error(result.error ?? "Unable to send your message.");
      }

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSuccess(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 lg:p-8">
      {success ? (
        <div className="py-6 text-center">
          <CheckCircle2
            aria-hidden="true"
            size={40}
            className="mx-auto text-accent"
          />
          <h2 className="mt-4 text-lg font-semibold text-primary">
            Message sent.
          </h2>
          <p className="mt-2 text-sm text-muted">
            Thanks for reaching out. We&apos;ll reply within 1-2 business days.
          </p>
          <button
            type="button"
            onClick={resetForm}
            className="mx-auto mt-6 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 text-sm text-primary hover:bg-primary/5"
          >
            <RotateCcw size={15} />
            Send another message
          </button>
        </div>
      ) : (
        <>
          <h2 className="font-heading text-xl font-semibold text-primary">
            Send us a message
          </h2>
          <p className="mt-1 text-sm text-muted">
            We&apos;ll get back to you as soon as we can.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="contact-name"
                className="mb-2 block text-sm font-medium text-primary"
              >
                Name
              </label>
              <Input
                id="contact-name"
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                required
                value={name}
                onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                onChange={(event) => setName(event.target.value)}
              />
              {touched.name && name.trim().length < 2 ? (
                <p className="mt-1 text-xs text-red-600">
                  Enter at least 2 characters.
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-2 block text-sm font-medium text-primary"
              >
                Email
              </label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                onChange={(event) => setEmail(event.target.value)}
              />
              {touched.email && !emailValid ? (
                <p className="mt-1 text-xs text-red-600">
                  Enter a valid email address.
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="mb-2 block text-sm font-medium text-primary"
              >
                Subject
              </label>
              <Input
                id="contact-subject"
                name="subject"
                minLength={3}
                maxLength={160}
                required
                value={subject}
                onBlur={() =>
                  setTouched((current) => ({ ...current, subject: true }))
                }
                onChange={(event) => setSubject(event.target.value)}
              />
              {touched.subject && subject.trim().length < 3 ? (
                <p className="mt-1 text-xs text-red-600">
                  Subject must be at least 3 characters.
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-2 block text-sm font-medium text-primary"
              >
                Message
              </label>
              <Textarea
                id="contact-message"
                name="message"
                rows={6}
                minLength={10}
                maxLength={3000}
                required
                value={message}
                onBlur={() =>
                  setTouched((current) => ({ ...current, message: true }))
                }
                onChange={(event) => setMessage(event.target.value)}
              />
              {touched.message && message.trim().length < 10 ? (
                <p className="mt-1 text-xs text-red-600">
                  Message must be at least 10 characters.
                </p>
              ) : null}
              <p className="mt-1 text-right text-xs text-muted">
                {message.length} / 3000
              </p>
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            ) : null}

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading || !formValid}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary font-medium text-cream hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 aria-hidden="true" size={17} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send aria-hidden="true" size={16} />
                    Send message
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-muted">
                We&apos;ll never share your email.
              </p>
            </div>
          </form>
        </>
      )}
    </Card>
  );
}
