"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VerificationStatus = "loading" | "success" | "error";

export function VerifyCard({ token }: { token: string }) {
  const [status, setStatus] = useState<VerificationStatus>("loading");

  useEffect(() => {
    void token;

    const timer = window.setTimeout(() => {
      setStatus("success");
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [token]);

  if (status === "loading") {
    return (
      <Card
        className="
          mx-auto w-full max-w-md rounded-lg border border-border bg-card
          p-5 text-center shadow-sm sm:p-8
        "
      >
        <Loader2 className="mx-auto animate-spin text-accent" size={40} />
        <h1 className="mt-6 font-heading text-xl font-bold text-primary">
          Verifying your email…
        </h1>
        <p className="mt-2 text-sm text-muted">Just a moment.</p>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card
        className="
          mx-auto w-full max-w-md rounded-lg border border-border bg-card
          p-5 text-center shadow-sm sm:p-8
        "
      >
        <CheckCircle2 className="mx-auto text-accent" size={48} />
        <h1 className="mt-6 font-heading text-2xl font-bold text-primary">
          Email verified.
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Your account is ready. You can now log in and start preparing.
        </p>
        <Button
          href="/login"
          className="mt-8 h-12 w-full rounded-md bg-primary text-cream hover:bg-primary-dark"
        >
          Go to Login
        </Button>
      </Card>
    );
  }

  return <ErrorCard />;
}

function ErrorCard() {
  return (
    <Card
      className="
        mx-auto w-full max-w-md rounded-lg border border-border bg-card
        p-5 text-center shadow-sm sm:p-8
      "
    >
      <XCircle className="mx-auto text-red-600" size={48} />
      <h1 className="mt-6 font-heading text-2xl font-bold text-primary">
        Link expired or invalid.
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Verification links expire after 24 hours. Request a new one below.
      </p>

      <Dialog
        trigger={(open) => (
          <Button
            type="button"
            onClick={open}
            className="mt-8 h-12 w-full rounded-md bg-primary text-cream hover:bg-primary-dark"
          >
            Resend verification email
          </Button>
        )}
      >
        <div className="mt-5 border-t border-cream/15 pt-5">
          <h2 className="font-heading text-lg font-bold text-cream">
            Resend verification
          </h2>
          <p className="mt-2 text-sm text-cream/70">
            Enter your email and we&apos;ll send a new verification link.
          </p>
          <Label htmlFor="resend-email" className="mt-5 block text-left text-cream">
            Email
          </Label>
          <Input id="resend-email" type="email" className="mt-2" />
          <Button
            type="button"
            className="mt-4 w-full rounded-md bg-accent text-primary-dark hover:bg-cream"
          >
            Send
          </Button>
          <p className="sr-only">
            NOTE: wire to /api/auth/resend-verification later.
          </p>
        </div>
      </Dialog>

      <Link
        href="/register"
        className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-md border border-primary px-5 text-sm font-medium text-primary hover:bg-primary hover:text-cream"
      >
        Back to Register
      </Link>
    </Card>
  );
}
