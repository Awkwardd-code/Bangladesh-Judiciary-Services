"use client";

import Link from "next/link";
import { Eye, EyeOff, Globe, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [nextPath, setNextPath] = useState("/dashboard");
  const [touched, setTouched] = useState({ email: false, password: false });
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const formValid = emailValid && password.length > 0;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPath = params.get("next");

    if (requestedPath?.startsWith("/") && !requestedPath.startsWith("//")) {
      setNextPath(requestedPath);
    }

    const authError = params.get("error");
    if (authError === "pending-approval") {
      setError("Your account is pending approval. Please try again later.");
    } else if (authError === "google") {
      setError("Google sign-in could not be completed. Please try again.");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = (await response.json()) as {
        error?: string;
        data?: {
          user?: {
            isAdmin?: number;
          };
        };
      };

      if (!response.ok) {
        throw new Error(data.error || "Unable to log in.");
      }

      const destination = data.data?.user?.isAdmin === 1 ? "/admin" : nextPath;

      router.push(destination);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to log in.",
      );
      setLoading(false);
    }
  }

  function startGoogleSignIn() {
    setGoogleLoading(true);
    window.location.assign(
      `/api/auth/google?next=${encodeURIComponent(nextPath)}`,
    );
  }

  return (
    <Card
      className="
        mx-auto w-full max-w-md rounded-lg border border-border bg-card
        p-6 shadow-sm sm:p-8
      "
    >
      <h1 className="font-heading text-2xl font-bold text-primary">
        Welcome back
      </h1>

      <p className="mt-2 text-sm text-muted">
        Login to continue your BJS preparation.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            required
          />
          {touched.email && !emailValid ? (
            <p className="mt-1 text-xs text-red-600">
              Enter a valid email address.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() =>
                setTouched((current) => ({ ...current, password: true }))
              }
              className="pr-10"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="
                absolute right-1 top-1/2 flex min-h-10 min-w-10
                -translate-y-1/2 items-center justify-center text-muted
                hover:text-primary
              "
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {touched.password && !password ? (
            <p className="mt-1 text-xs text-red-600">Enter your password.</p>
          ) : null}

          <div className="mt-2 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted">
              <Checkbox
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <ButtonWithIcon
          type="submit"
          icon={LogIn}
          disabled={loading || !formValid}
          className="h-12 w-full rounded-md"
        >
          {loading ? "Logging in..." : "Login"}
        </ButtonWithIcon>

        <Divider />

        <ButtonWithIcon
          type="button"
          icon={Globe}
          disabled={googleLoading || loading}
          onClick={startGoogleSignIn}
          className="h-12 w-full rounded-md border-border bg-white text-foreground hover:bg-background"
          variant="outline"
        >
          <span
            aria-hidden="true"
            className="bg-gradient-to-br from-blue-600 via-green-600 to-red-600 bg-clip-text font-bold text-transparent"
          >
            G
          </span>
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </ButtonWithIcon>

        <p className="text-center text-sm text-muted">
          New here?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </Card>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <span className="h-px flex-1 bg-border" />
      <span>or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
