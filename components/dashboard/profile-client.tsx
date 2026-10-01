"use client";

import { Check, LockKeyhole, Pencil, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/image-uploader";
import { toast } from "@/components/ui/toaster";

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
  });
  const [editing, setEditing] = useState(false);
  const [profileTouched, setProfileTouched] = useState({ name: false, phone: false });
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl);
  const [avatarPublicId, setAvatarPublicId] = useState(
    initialUser.avatarPublicId,
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
    draft.name.trim().length >= 2 && draft.name.trim().length <= 80 &&
    draft.phone.trim().length <= 20;

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          phone: draft.phone,
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
      toast("Your profile has been updated.");
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
        getErrorMessage(error, "Unable to update your password."),
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  const details = [
    { label: "Full name", value: user.name, key: "name" as const },
    { label: "Email", value: user.email },
    {
      label: "Phone",
      value: user.phone || "Not provided",
      key: "phone" as const,
    },
    { label: "Roll number", value: user.roll || "Not provided" },
    { label: "University", value: user.university || "Not provided" },
    { label: "Student ID", value: user.studentId || "Not provided" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <h1 className="font-heading text-2xl font-bold text-primary lg:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage your account details and preferences.
        </p>
      </header>

      <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex flex-col items-center gap-3">
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
              helperText="JPEG, PNG, or WebP. Max 5 MB."
            />
          </div>

          <div className="flex-1 text-center lg:text-left">
            <h2 className="font-heading text-2xl font-bold text-primary">
              {user.name}
            </h2>
            <p className="mt-1 text-sm text-muted">{user.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
              <Badge className="border-primary/20 text-primary">
                {user.tier === "UNIVERSITY"
                  ? "University student"
                  : "General student"}
              </Badge>
              <Badge
                className={
                  user.verified
                    ? "border-emerald-600/30 text-emerald-700"
                    : "border-amber-600/30 text-amber-700"
                }
              >
                {user.verified ? "Email verified" : "Email not verified"}
              </Badge>
            </div>
            <p className="mt-4 text-xs text-muted">
              Member since {formatDate(user.createdAt)}.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-bold text-primary">
            Personal information
          </h2>
          {!editing ? (
            <Button
              type="button"
              onClick={() => setEditing(true)}
              className="h-9 rounded-md bg-transparent px-3 text-primary hover:bg-primary/5"
            >
              <Pencil size={16} />
              Edit
            </Button>
          ) : null}
        </div>

        <form onSubmit={saveProfile}>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {details.map((detail) => (
              <div key={detail.label} className="space-y-2">
                <Label
                  htmlFor={`profile-${detail.label}`}
                  className="text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {detail.label}
                </Label>
                {editing && detail.key ? (
                  <Input
                    id={`profile-${detail.label}`}
                    value={draft[detail.key]}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [detail.key]: event.target.value,
                      }))
                    }
                    onBlur={() =>
                      setProfileTouched((current) => ({
                        ...current,
                        [detail.key as "name" | "phone"]: true,
                      }))
                    }
                    minLength={detail.key === "name" ? 2 : undefined}
                    maxLength={detail.key === "name" ? 80 : 20}
                    className="focus-visible:ring-2 focus-visible:ring-accent"
                    required={detail.key === "name"}
                  />
                ) : (
                  <Input
                    id={`profile-${detail.label}`}
                    value={detail.value}
                    readOnly
                    className="border-transparent bg-background font-medium text-foreground read-only:cursor-default"
                  />
                )}
                {editing && detail.key === "name" && profileTouched.name &&
                draft.name.trim().length < 2 ? (
                  <p className="mt-1 text-xs text-red-600">
                    Name must be at least 2 characters.
                  </p>
                ) : null}
                {editing && detail.key === "phone" && profileTouched.phone &&
                draft.phone.trim().length > 20 ? (
                  <p className="mt-1 text-xs text-red-600">
                    Phone must be 20 characters or fewer.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          {editing ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={saving || !profileValid}
                className="rounded-md bg-primary text-cream hover:bg-primary-dark"
              >
                <Check size={16} />
                {saving ? "Saving" : "Save"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setDraft({ name: user.name, phone: user.phone ?? "" });
                  setEditing(false);
                }}
                className="rounded-md border border-border bg-transparent text-primary hover:bg-primary/5"
              >
                <X size={16} />
                Cancel
              </Button>
            </div>
          ) : null}
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm lg:p-8">
        <h2 className="font-heading text-lg font-bold text-primary">
          Security
        </h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Change password
            </p>
            <p className="mt-1 text-sm text-muted">
              Update your password regularly to keep your account secure.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setPasswordOpen(true)}
            className="shrink-0 rounded-md border border-border bg-transparent text-primary hover:bg-primary/5"
          >
            <LockKeyhole size={16} />
            Change password
          </Button>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-red-200 bg-red-50/40 p-6 lg:p-8">
        <h2 className="font-heading text-lg font-bold text-red-700">
          Danger zone
        </h2>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-700">
            Once you delete your account, there is no going back.
          </p>
          <button
            type="button"
            disabled
            title="Contact support to delete your account."
            className="
              min-h-10 cursor-not-allowed rounded-md bg-red-600 px-4
              text-sm font-medium text-white opacity-60
            "
          >
            Delete account
          </button>
        </div>
      </section>

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
    </div>
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
        className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
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
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-600">
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
    new Date(value),
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
