const REQUIRED = [
  "MONGODB_URI",
  "JWT_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

const OPTIONAL = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

const missing: string[] = [];
const gmailUser = process.env.GMAIL_USER ?? process.env.SMTP_USER ?? "";
const gmailAppPassword =
  process.env.GMAIL_APP_PASSWORD ?? process.env.SMTP_PASSWORD ?? "";
const sessionMaxAgeDays = Number(process.env.SESSION_MAX_AGE_DAYS ?? 7);
const sessionRefreshAfterDays = Number(
  process.env.SESSION_REFRESH_AFTER_DAYS ?? 6,
);
const requestedSameSite = process.env.COOKIE_SAME_SITE;
const cookieSameSite =
  requestedSameSite === "strict" || requestedSameSite === "none"
    ? requestedSameSite
    : "lax";

for (const key of REQUIRED) {
  if (!process.env[key]) {
    missing.push(key);
  }
}

if (!gmailUser) {
  missing.push("GMAIL_USER");
}

if (!gmailAppPassword) {
  missing.push("GMAIL_APP_PASSWORD");
}

if (missing.length > 0) {
  throw new Error(
    "Missing required environment variables: " +
      missing.join(", ") +
      ". See .env.example for the full list.",
  );
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters.");
}

export const env = {
  MONGODB_URI: process.env.MONGODB_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  GMAIL_USER: gmailUser,
  GMAIL_APP_PASSWORD: gmailAppPassword,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",

  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",

  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: 465,
  SMTP_SECURE: true,
  SMTP_USER: gmailUser,
  SMTP_PASSWORD: gmailAppPassword,

  NODE_ENV: process.env.NODE_ENV ?? "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  SESSION_MAX_AGE_DAYS:
    Number.isFinite(sessionMaxAgeDays) && sessionMaxAgeDays > 0
      ? Math.floor(sessionMaxAgeDays)
      : 7,
  SESSION_REFRESH_AFTER_DAYS:
    Number.isFinite(sessionRefreshAfterDays) && sessionRefreshAfterDays > 0
      ? Math.floor(sessionRefreshAfterDays)
      : 6,
  SESSION_BIND_IP: process.env.SESSION_BIND_IP === "true",
  COOKIE_SECURE:
    process.env.NODE_ENV === "production" ||
    process.env.COOKIE_SECURE === "true",
  COOKIE_SAME_SITE: cookieSameSite,
} as const;

// NOTE: lib/db.ts, lib/mailer.ts, lib/auth.ts, and
// lib/cloudinary.ts must import env from this file instead of
// reading process.env directly.
