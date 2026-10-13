import nodemailer from "nodemailer";

import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { TIMEOUTS, withTimeout } from "@/lib/with-timeout";

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

export async function sendRegistrationCodeEmail(
  to: string,
  code: string
): Promise<void> {
  try {
    await withTimeout(
      transporter.sendMail({
        from: `"LegalPath Bangladesh" <${env.SMTP_USER}>`,
        to,
        subject: "Your LegalPath Bangladesh verification code",
        html: registrationCodeTemplate(code),
        text: `Your LegalPath Bangladesh verification code is ${code}. This code expires in 1 hour. If you didn't request this, ignore this email.`,
      }),
      TIMEOUTS.SMTP,
      "email"
    );
  } catch (error) {
    logger.warn("Email delivery timed out or failed", {
      label: "registration_code",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function sendPasswordResetEmail(
  to: string,
  code: string
): Promise<void> {
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${code}`;

  try {
    await withTimeout(
      transporter.sendMail({
        from: `"LegalPath Bangladesh" <${env.SMTP_USER}>`,
        to,
        subject: "Reset your LegalPath Bangladesh password",
        html: passwordResetTemplate(resetUrl, code),
        text: `Reset your LegalPath Bangladesh password: ${resetUrl}\n\nYour reset code is ${code}. This link expires in 1 hour and can be used only once.`,
      }),
      TIMEOUTS.SMTP,
      "email"
    );
  } catch (error) {
    logger.warn("Email delivery timed out or failed", {
      label: "password_reset",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function registrationCodeTemplate(code: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f7f5ef;font-family:Arial,sans-serif;color:#20252d"><div style="max-width:560px;margin:32px auto;background:#fff"><div style="background:#14233b;padding:24px;color:#f7f5ef;font-size:22px;font-weight:700">LegalPath Bangladesh</div><div style="padding:32px;text-align:center"><h1 style="margin:0 0 16px;color:#14233b">Verify your email</h1><p style="color:#68717d;line-height:1.6">Enter this code to complete your registration:</p><div style="margin:24px 0;font-size:32px;letter-spacing:8px;font-weight:700;color:#14233b">${code}</div><p style="font-size:13px;color:#68717d">This code expires in 1 hour.</p><p style="font-size:13px;color:#68717d">If you didn't request this, ignore this email.</p></div></div></body></html>`;
}

function passwordResetTemplate(resetUrl: string, code: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f7f5ef;font-family:Arial,sans-serif;color:#20252d"><div style="max-width:560px;margin:32px auto;background:#fff"><div style="background:#14233b;padding:24px;color:#f7f5ef;font-size:22px;font-weight:700">LegalPath Bangladesh</div><div style="padding:32px;text-align:center"><h1 style="margin:0 0 16px;color:#14233b">Reset your password</h1><p style="color:#68717d;line-height:1.6">Use the button below to choose a new password.</p><a href="${resetUrl}" style="display:inline-block;margin-top:20px;background:#b78a3b;color:#0d1729;padding:13px 22px;text-decoration:none;font-weight:700">Reset Password</a><p style="margin-top:24px;font-size:13px;color:#68717d">This link expires in 1 hour and can be used only once.</p><p style="font-size:13px;color:#68717d">Your reset code: ${code}</p></div></div></body></html>`;
}
