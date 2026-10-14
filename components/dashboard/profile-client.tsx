"use client";

import {
  AtSign,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  Fingerprint,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ImageUploader } from "@/components/ui/image-uploader";
import { toast } from "@/components/ui/toaster";
import {
  getDefaultAvatarUrl,
  isDefaultAvatarUrl,
  type ProfileGender,
} from "@/lib/profile-avatar";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  tier: "UNIVERSITY" | "OTHER";
  roll: string | null;
  university: string | null;
  studentId: string | null;
  phone: string | null;
  gender: ProfileGender | null;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  verified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

type ApiResult<T> = {
  data?: T;
  error?: string;
};

export function ProfileClient({ user: initialUser }: { user: ProfileUser }) {
  const [user, setUser] = useState(initialUser);
  const [draft, setDraft] = useState({
    name: initialUser.name,
    phone: initialUser.phone ?? "",
    gender: initialUser.gender ?? "",
  });
  const [editing, setEditing] = useState(false);
  const [profileTouched, setProfileTouched] = useState({
    name: false,
    phone: false,
  });
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl);
  const [avatarPublicId, setAvatarPublicId] = useState(
    initialUser.avatarPublicId
  );
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const profileValid =
    draft.name.trim().length >= 2 &&
    draft.name.trim().length <= 80 &&
    draft.phone.trim().length <= 20;

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const previousAvatarPublicId = user.avatarPublicId;

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          phone: draft.phone,
          ...(draft.gender ? { gender: draft.gender } : {}),
          ...(avatarDirty ? { avatarUrl, avatarPublicId } : {}),
        }),
      });
      const result = (await response.json()) as ApiResult<{
        user: Partial<ProfileUser>;
      }>;

      if (!response.ok || !result.data?.user) {
        throw new Error(result.error ?? "Unable to update your profile.");
      }

      setUser((current) => ({
        ...current,
        ...result.data?.user,
        avatarUrl,
        avatarPublicId,
      }));
      setEditing(false);
      setAvatarDirty(false);
      setProfileTouched({ name: false, phone: false });
      toast("Your profile has been updated.");

      if (
        avatarDirty &&
        previousAvatarPublicId &&
        previousAvatarPublicId !== avatarPublicId
      ) {
        try {
          const cleanupResponse = await fetch("/api/cloudinary/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId: previousAvatarPublicId }),
          });

          if (!cleanupResponse.ok) {
            throw new Error("Unable to remove the previous profile image.");
          }
        } catch (cleanupError) {
          console.error(
            "Failed to clean up the previous profile image.",
            cleanupError
          );
          toast(
            "Your profile was saved, but the previous profile image could not be removed.",
            "error"
          );
        }
      }
    } catch (error) {
      toast(getErrorMessage(error, "Unable to update your profile."), "error");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const result = (await response.json()) as ApiResult<{
        message: string;
      }>;

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to update your password.");
      }

      setPasswordOpen(false);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast(result.data?.message ?? "Password updated.");
    } catch (error) {
      setPasswordError(
        getErrorMessage(error, "Unable to update your password.")
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  const details = [
    {
      label: "Full name",
      value: user.name,
      key: "name" as const,
      icon: UserRound,
    },
    { label: "Email address", value: user.email, icon: AtSign },
    {
      label: "Phone number",
      value: user.phone || "Not provided",
      key: "phone" as const,
      icon: Phone,
    },
    {
      label: "Gender",
      value: user.gender
        ? user.gender === "female"
          ? "Female"
          : "Male"
        : "Not set",
      key: "gender" as const,
      icon: UserRound,
    },
    ...(user.role === "student"
      ? [
          {
            label: "University",
            value: user.university || "Not provided",
            icon: GraduationCap,
          },
          {
            label: "Roll number",
            value: user.roll || "Not provided",
            icon: Fingerprint,
          },
          {
            label: "Student ID",
            value: user.studentId || "Not provided",
            icon: BadgeCheck,
          },
        ]
      : []),
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
      <header className="relative isolate overflow-hidden rounded-[1.75rem] bg-primary px-5 py-6 text-cream shadow-lg shadow-primary/10 sm:px-8 sm:py-8">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 -z-10 size-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-on-dark">
              <UserRound size={14} aria-hidden="true" />
              Account settings
            </p>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Your profile
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-cream/75 sm:text-base">
              Manage your personal details, account information, and sign-in
              security in one place.
            </p>
          </div>
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-cream/15 bg-cream/[0.06] px-4 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cream/10 text-accent-on-dark">
              <CalendarDays size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-cream/60">
                Member since
              </p>
              <p className="mt-0.5 text-sm font-semibold text-cream">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.8fr)] lg:items-start">
        <aside className="space-y-5">
          <section
            aria-label="Profile summary"
            className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
          >
            <div className="relative h-24 bg-[radial-gradient(ellipse_at_top_right,rgba(232,184,109,0.42),transparent_55%),linear-gradient(130deg,#0b4b40,#123e36)]">
              <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/85">
                <ShieldCheck size={12} aria-hidden="true" />
                {user.role === "admin" ? "Admin" : "Student"}
              </span>
            </div>
            <div className="px-5 pb-5">
              <div className="-mt-12 flex flex-col items-center text-center">
                <div className="flex size-28 shrink-0 items-center justify-center rounded-full border-4 border-card bg-card p-1">
                  <ImageUploader
                    value={avatarUrl}
                    publicId={avatarPublicId}
                    onChange={({ url, publicId }) => {
                      setAvatarUrl(url);
                      setAvatarPublicId(publicId);
                      setAvatarDirty(true);
                      setEditing(true);
                    }}
                    folder={`bjs-prep/avatars/${user.id}`}
                    aspect="square"
                    size={96}
                    disabled={saving}
                    deferCleanup
                  />
                </div>
                <p className="mt-2 max-w-56 text-xs leading-5 text-muted">
                  Tap the image to replace or remove it. JPEG, PNG, or WebP up
                  to 5 MB.
                </p>
                <h2 className="mt-3 max-w-full break-words font-heading text-xl font-bold text-primary">
                  {user.name}
                </h2>
                <p className="mt-1 max-w-full break-all text-sm text-muted">
                  {user.email}
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.04] px-3 py-1 text-[11px] font-semibold text-primary">
                    <UserRound size={12} aria-hidden="true" />
                    {user.role === "admin"
                      ? "Administrator"
                      : user.tier === "UNIVERSITY"
                        ? "University student"
                        : "General student"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      user.verified
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {user.verified ? (
                      <CheckCircle2 size={12} aria-hidden="true" />
                    ) : (
                      <Mail size={12} aria-hidden="true" />
                    )}
                    {user.verified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-border pt-4">
                <SummaryRow
                  icon={<CalendarDays size={15} aria-hidden="true" />}
                  label="Member since"
                  value={formatDate(user.createdAt)}
                />
                {user.role === "student" ? (
                  <SummaryRow
                    icon={<GraduationCap size={15} aria-hidden="true" />}
                    label="Study tier"
                    value={
                      user.tier === "UNIVERSITY"
                        ? "University student"
                        : "General student"
                    }
                  />
                ) : (
                  <SummaryRow
                    icon={<ShieldCheck size={15} aria-hidden="true" />}
                    label="Access"
                    value="Administrator"
                  />
                )}
                <SummaryRow
                  icon={<LockKeyhole size={15} aria-hidden="true" />}
                  label="Last sign-in"
                  value={
                    user.lastLoginAt
                      ? formatDate(user.lastLoginAt)
                      : "Not available"
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                <ShieldCheck size={17} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-emerald-900">
                  Account protection
                </h2>
                <p className="mt-1 text-xs leading-5 text-emerald-800/80">
                  Your account details are private. Never share your password
                  or sign-in codes.
                </p>
              </div>
            </div>
          </section>
        </aside>

        <div className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Profile details
                </p>
                <h2 className="mt-1 font-heading text-xl font-bold text-primary">
                  Personal information
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Keep your account information accurate and up to date.
                </p>
              </div>
              {!editing ? (
                <Button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="min-h-10 w-full rounded-xl border border-border bg-background text-primary transition hover:border-primary/30 hover:bg-primary/[0.03] sm:w-auto"
                >
                  <Pencil size={15} aria-hidden="true" />
                  Edit profile
                </Button>
              ) : null}
            </div>

            <form onSubmit={saveProfile}>
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
                {details.map((detail) => {
                  const Icon = detail.icon;
                  const fieldKey = "key" in detail ? detail.key : undefined;

                  return (
                    <div
                      key={detail.label}
                      className="min-w-0 rounded-xl border border-border/70 bg-background/60 p-3.5 sm:p-4"
                    >
                      <Label
                        htmlFor={
                          editing && fieldKey
                            ? `profile-${detail.label}`
                            : undefined
                        }
                        className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted"
                      >
                        <Icon size={13} aria-hidden="true" />
                        {detail.label}
                      </Label>
                      {editing && fieldKey === "gender" ? (
                        <Select
                          id={`profile-${detail.label}`}
                          value={draft.gender}
                          onChange={(event) => {
                            const gender = event.target.value as
                              | ProfileGender
                              | "";
                            setDraft((current) => ({ ...current, gender }));

                            if (
                              gender &&
                              !avatarPublicId &&
                              (!avatarUrl || isDefaultAvatarUrl(avatarUrl))
                            ) {
                              setAvatarUrl(getDefaultAvatarUrl(gender));
                              setAvatarDirty(true);
                            }
                          }}
                          className="mt-2 h-11 w-full border-border bg-card font-medium"
                        >
                          <option value="">Choose an option</option>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                        </Select>
                      ) : editing && fieldKey ? (
                        <Input
                          id={`profile-${detail.label}`}
                          value={draft[fieldKey]}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              [fieldKey]: event.target.value,
                            }))
                          }
                          onBlur={() =>
                            setProfileTouched((current) => ({
                              ...current,
                              [fieldKey]: true,
                            }))
                          }
                          minLength={fieldKey === "name" ? 2 : undefined}
                          maxLength={fieldKey === "name" ? 80 : 20}
                          placeholder={
                            fieldKey === "phone"
                              ? "Add your phone number"
                              : "Enter your full name"
                          }
                          className="mt-2 h-11 border-border bg-card font-medium focus-visible:ring-2 focus-visible:ring-accent"
                          required={fieldKey === "name"}
                        />
                      ) : (
                        <div
                          id={`profile-${detail.label}`}
                          className="mt-2 flex min-h-11 min-w-0 items-center text-sm font-semibold text-foreground"
                        >
                          <span className="truncate">
                            {detail.value}
                          </span>
                          {detail.label === "Email address" ? (
                            <span
                              title="Email cannot be changed here"
                              className="ml-auto shrink-0 rounded-md bg-primary/5 px-2 py-1 text-[10px] font-medium text-muted"
                            >
                              Cannot edit
                            </span>
                          ) : null}
                        </div>
                      )}
                      {editing &&
                      fieldKey === "name" &&
                      profileTouched.name &&
                      draft.name.trim().length < 2 ? (
                        <p className="mt-1.5 text-xs text-red-600">
                          Enter at least 2 characters.
                        </p>
                      ) : null}
                      {editing &&
                      fieldKey === "phone" &&
                      profileTouched.phone &&
                      draft.phone.trim().length > 20 ? (
                        <p className="mt-1.5 text-xs text-red-600">
                          Phone number must be 20 characters or fewer.
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {editing ? (
                <div className="flex flex-col-reverse gap-3 border-t border-border bg-background/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <p className="text-xs leading-5 text-muted">
                    Changes are saved to your account when you select Save.
                  </p>
                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <Button
                      type="button"
                      onClick={() => {
                        setDraft({
                          name: user.name,
                          phone: user.phone ?? "",
                          gender: user.gender ?? "",
                        });
                        setAvatarUrl(user.avatarUrl);
                        setAvatarPublicId(user.avatarPublicId);
                        setAvatarDirty(false);
                        setProfileTouched({ name: false, phone: false });
                        setEditing(false);
                      }}
                      className="min-h-11 rounded-xl border border-border bg-card text-primary hover:bg-primary/5"
                    >
                      <X size={15} aria-hidden="true" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        saving ||
                        !profileValid ||
                        (!avatarDirty &&
                          draft.name === user.name &&
                          draft.phone === (user.phone ?? "") &&
                          draft.gender === (user.gender ?? ""))
                      }
                      className="min-h-11 rounded-xl bg-primary px-5 text-cream hover:bg-primary-dark"
                    >
                      <Check size={16} aria-hidden="true" />
                      {saving ? "Saving changes..." : "Save changes"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <KeyRound size={19} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                    Keep your account safe
                  </p>
                  <h2 className="mt-1 font-heading text-lg font-bold text-primary">
                    Sign-in &amp; security
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-muted">
                    Update your password regularly and keep it private.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setPasswordOpen(true)}
                className="min-h-11 w-full shrink-0 rounded-xl border border-border bg-background text-primary transition hover:border-primary/30 hover:bg-primary/[0.03] sm:w-auto"
              >
                <LockKeyhole size={16} aria-hidden="true" />
                Change password
              </Button>
            </div>
          </section>
        </div>
      </div>

      {passwordOpen ? (
        <PasswordDialog
          error={passwordError}
          passwords={passwords}
          saving={passwordSaving}
          onClose={() => {
            setPasswordOpen(false);
            setPasswordError("");
          }}
          onChange={setPasswords}
          onSubmit={changePassword}
        />
      ) : null}
    </main>
  );
}

function PasswordDialog({
  error,
  passwords,
  saving,
  onClose,
  onChange,
  onSubmit,
}: {
  error: string;
  passwords: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  saving: boolean;
  onClose: () => void;
  onChange: (value: typeof passwords) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const passwordValid =
    passwords.currentPassword.length > 0 &&
    passwords.newPassword.length >= 8 &&
    passwords.newPassword === passwords.confirmPassword;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-primary-dark/70 p-4">
      <button
        type="button"
        aria-label="Close password dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="change-password-title"
              className="font-heading text-lg font-bold text-primary"
            >
              Change password
            </h2>
            <p className="mt-1 text-sm text-muted">
              Enter your current password and choose a new one.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="cursor-pointer rounded p-1 text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <PasswordField
            id="current-password"
            label="Current password"
            value={passwords.currentPassword}
            onChange={(currentPassword) =>
              onChange({ ...passwords, currentPassword })
            }
            required
            onBlur={() =>
              setTouched((current) => ({ ...current, currentPassword: true }))
            }
          />
          <PasswordField
            id="new-password"
            label="New password"
            value={passwords.newPassword}
            onChange={(newPassword) => onChange({ ...passwords, newPassword })}
            required
            minLength={8}
            onBlur={() =>
              setTouched((current) => ({ ...current, newPassword: true }))
            }
          />
          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            value={passwords.confirmPassword}
            onChange={(confirmPassword) =>
              onChange({ ...passwords, confirmPassword })
            }
            required
            minLength={8}
            onBlur={() =>
              setTouched((current) => ({ ...current, confirmPassword: true }))
            }
          />
          {touched.newPassword && passwords.newPassword.length < 8 ? (
            <p className="text-xs text-red-600">
              New password must be at least 8 characters.
            </p>
          ) : null}
          {touched.confirmPassword &&
          passwords.newPassword !== passwords.confirmPassword ? (
            <p className="text-xs text-red-600">Passwords do not match.</p>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-transparent text-primary hover:bg-primary/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !passwordValid}
              className="rounded-md bg-primary text-cream hover:bg-primary-dark"
            >
              {saving ? "Saving" : "Save password"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  required = false,
  minLength,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  onBlur?: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        autoComplete={
          id === "current-password" ? "current-password" : "new-password"
        }
        value={value}
        required={required}
        minLength={minLength}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        maxLength={72}
        className="focus-visible:ring-2 focus-visible:ring-accent"
      />
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
    new Date(value)
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/[0.04] text-primary/70">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-xs text-muted">{label}</span>
      <span className="max-w-[55%] truncate text-right text-xs font-semibold text-primary">
        {value}
      </span>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
