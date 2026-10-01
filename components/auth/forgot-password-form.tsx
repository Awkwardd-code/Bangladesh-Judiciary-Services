"use client";

import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!emailValid || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to send a reset link.");
      }

      setSubmitted(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to send a reset link.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card
        className="
          mx-auto w-full max-w-md rounded-lg border border-border bg-card
          p-5 shadow-sm sm:p-8
        "
      >
        <CheckCircle2 className="mx-auto text-accent" size={48} />
        <h1 className="mt-6 text-center font-heading text-xl font-bold text-primary">
          Check your email.
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-muted">
          If an account exists for {email}, we&apos;ve sent a reset link. The link
          expires in 30 minutes.
        </p>
        <p className="mt-6 text-center text-xs text-muted">
          Didn&apos;t receive it? Check spam or try again in a few minutes.
        </p>
        <Link
          href="/login"
          className="mt-8 block text-center text-sm text-accent hover:underline"
        >
          Back to login
        </Link>
      </Card>
    );
  }

  return (
    <Card
      className="
        mx-auto w-full max-w-md rounded-lg border border-border bg-card
        p-5 shadow-sm sm:p-8
      "
    >
      <h1 className="font-heading text-2xl font-bold text-primary">
        Forgot your password?
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Enter the email address linked to your account and we&apos;ll send a reset
        link.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched(true)}
            required
          />
          {touched && !emailValid ? (
            <p className="mt-1 text-xs text-red-600">
              Enter a valid email address.
            </p>
          ) : null}
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        <ButtonWithIcon
          type="submit"
          icon={Send}
          disabled={loading || !emailValid}
          className="h-12 w-full rounded-md"
        >
          {loading ? "Sending..." : "Send reset link"}
        </ButtonWithIcon>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Back to login
        </Link>
      </p>
    </Card>
  );
}
