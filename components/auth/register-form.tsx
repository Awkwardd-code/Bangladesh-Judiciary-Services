"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterVisualPanel } from "@/components/auth/register-visual-panel";
import { detectUniversityEmail } from "@/lib/university-email";

type Step = "form" | "verify";

type RegistrationValues = {
  name: string;
  email: string;
  password: string;
};

const initialValues: RegistrationValues = {
  name: "",
  email: "",
  password: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [values, setValues] = useState<RegistrationValues>(initialValues);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingId, setPendingId] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });
  const emailDetection = detectUniversityEmail(values.email);
  const emailHint = getEmailHint(values.email, emailDetection);
  const formValid =
    values.name.trim().length >= 2 &&
    emailDetection.isValidEmail &&
    values.password.length >= 8 &&
    agreed;

  function updateValue(field: keyof RegistrationValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function startGoogleSignUp() {
    setGoogleLoading(true);
    window.location.assign("/api/auth/google?next=%2Fdashboard");
  }

  function validateForm() {
    if (values.name.trim().length < 2) {
      return "Please enter your full name.";
    }

    if (!emailDetection.isValidEmail) {
      return "Invalid email address.";
    }

    if (values.password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (!agreed) {
      return "Please accept the terms and privacy policy.";
    }

    return "";
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        data?: {
          pendingId?: string;
          message?: string;
        };
      };

      if (!response.ok) {
        throw new Error(data.error || "Unable to create your account.");
      }

      setPendingId(data.data?.pendingId ?? "");
      setPendingEmail(values.email.trim().toLowerCase());
      setVerificationCode("");
      setStep("verify");
      setSuccess(data.data?.message || "Verification code sent to your email.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!pendingId) {
      return;
    }

    setResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/resend-registration-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pendingId }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to resend the code.");
      }

      setSuccess(data.message || "A new verification code has been sent.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to resend the code.",
      );
    } finally {
      setResending(false);
    }
  }

  async function verifyCode() {
    if (!pendingId) {
      setError("Your verification session is missing. Please register again.");
      return;
    }

    if (!/^\d{8}$/.test(verificationCode)) {
      setError("Enter the 8-digit verification code sent to your email.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/verify-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pendingId,
          code: verificationCode,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Invalid verification code.");
      }

      router.push("/dashboard");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden h-screen overflow-hidden lg:block">
        <RegisterVisualPanel />
      </div>

      <div
        className="
          flex h-screen min-h-0 flex-col overflow-y-auto overscroll-y-contain bg-background
          lg:flex-row lg:items-center lg:justify-center lg:px-16 lg:py-16
        "
      >
        {/* MOBILE-ONLY BLOCK */}
        <div className="w-full shrink-0 bg-primary px-6 py-8 text-cream lg:hidden">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cream/70">
            BANGLADESH JUDICIAL SERVICE
          </p>
          <h1 className="mt-3 font-heading text-2xl font-bold leading-tight">
            From campus to the courtroom.
          </h1>
          <p className="mt-2 text-sm text-cream/80">
            Courses, model tests, and mentor-led review.
          </p>
        </div>

        <div
          className="
            flex w-full flex-1 items-center justify-center px-6 py-8
            lg:max-w-md lg:flex-none lg:px-0 lg:py-0
          "
        >
          <div className="w-full max-w-md">
          <div
            className="
              bg-white
              p-4
              sm:p-5
              lg:p-4
            "
          >
        {step === "form" ? (
          <>
            <div className="mb-4 lg:mb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Create account
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold text-primary">
                Start your BJS Prep journey.
              </h2>
            </div>

            <form onSubmit={submit} className="space-y-4 lg:space-y-3">
              <Field
                id="name"
                label="Full name"
                type="text"
                value={values.name}
                onChange={(value) => updateValue("name", value)}
                onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                placeholder="Your full name"
                required
              />
              {touched.name && values.name.trim().length < 2 ? (
                <p className="mt-1 text-xs text-red-600">
                  Enter at least 2 characters.
                </p>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => updateValue("email", event.target.value)}
                  onBlur={() =>
                    setTouched((current) => ({ ...current, email: true }))
                  }
                  placeholder="you@example.com"
                  required
                />
                {touched.email && !emailDetection.isValidEmail ? (
                  <p className="mt-1 text-xs text-red-600">
                    Enter a valid email address.
                  </p>
                ) : (
                  <p aria-live="polite" className="text-xs text-muted">
                    {emailHint.text}
                  </p>
                )}
              </div>

              <PasswordField
                id="password"
                label="Password"
                value={values.password}
                onChange={(value) => updateValue("password", value)}
                onBlur={() =>
                  setTouched((current) => ({ ...current, password: true }))
                }
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                placeholder="Minimum 8 characters"
                required
              />
              {touched.password && values.password.length < 8 ? (
                <p className="mt-1 text-xs text-red-600">
                  Password must be at least 8 characters.
                </p>
              ) : null}

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-cream px-3 py-2 text-sm text-muted">
                <Checkbox
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  required
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="text-accent hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {error ? (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <ButtonWithIcon
                type="submit"
                icon={UserRound}
                disabled={loading || !formValid}
                className="h-11 w-full rounded-md bg-primary text-base font-medium text-cream hover:bg-primary-dark disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </ButtonWithIcon>

              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="h-px flex-1 bg-border" />
                <span>or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <ButtonWithIcon
                type="button"
                icon={Globe}
                variant="outline"
                disabled={googleLoading || loading}
                onClick={startGoogleSignUp}
                className="h-11 w-full rounded-md border border-border bg-white text-primary hover:bg-cream"
              >
                <span
                  aria-hidden="true"
                  className="bg-gradient-to-br from-blue-600 via-green-600 to-red-600 bg-clip-text font-bold text-transparent"
                >
                  G
                </span>
                {googleLoading ? "Connecting to Google..." : "Sign up with Google"}
              </ButtonWithIcon>

              <p className="text-center text-sm text-muted">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-accent hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent"
            >
              <ArrowLeft size={16} />
              Back to form
            </button>

            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <ShieldCheck size={18} />
              Verification code sent to {pendingEmail}
            </div>

              <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification code</Label>
                <Input
                  id="verification-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={verificationCode}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  placeholder="Enter 8-digit code"
                  className="tracking-[0.35em] text-center text-lg"
                  maxLength={8}
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonWithIcon
                  type="button"
                  icon={Check}
                  onClick={verifyCode}
                  disabled={loading || verificationCode.length !== 8}
                  className="h-11 flex-1 rounded-md bg-primary text-cream hover:bg-primary-dark disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify account"
                  )}
                </ButtonWithIcon>

                <ButtonWithIcon
                  type="button"
                  icon={RefreshCw}
                  variant="outline"
                  onClick={resendCode}
                  disabled={resending}
                  className="h-11 rounded-md border border-border bg-white text-primary hover:bg-cream disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resending ? "Sending..." : "Resend code"}
                </ButtonWithIcon>
              </div>
            </div>
          </>
        )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function getEmailHint(
  email: string,
  detection: ReturnType<typeof detectUniversityEmail>,
): { text: string; invalid: boolean } {
  if (email.trim() && email.includes("@") && !detection.isValidEmail) {
    return { text: "Invalid email address.", invalid: true };
  }

  if (!detection.isUniversityEmail) {
    return {
      text: "University email is preferred for automatic university and Student ID detection.",
      invalid: false,
    };
  }

  if (detection.studentId && detection.confidence === "high") {
    return {
      text: `University recognized: ${detection.university}. Student ID detected.`,
      invalid: false,
    };
  }

  return {
    text: "University recognized, but Student ID could not be determined automatically.",
    invalid: false,
  };
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  showPassword,
  setShowPassword,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="pr-10"
          required={required}
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword(!showPassword)}
          className="
            absolute right-1 top-1/2 flex min-h-10 min-w-10
            -translate-y-1/2 items-center justify-center text-muted
            hover:text-primary
          "
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}
