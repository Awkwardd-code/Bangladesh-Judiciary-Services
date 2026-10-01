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
  code: string,
): Promise<void> {
  try {
    await withTimeout(
      transporter.sendMail({
        from: `"BJS Prep" <${env.SMTP_USER}>`,
        to,
        subject: "Your BJS Prep verification code",
        html: registrationCodeTemplate(code),
        text: `Your BJS Prep verification code is ${code}. This code expires in 1 hour. If you didn't request this, ignore this email.`,
      }),
      TIMEOUTS.SMTP,
      "email",
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
  code: string,
): Promise<void> {
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${code}`;

  try {
    await withTimeout(
      transporter.sendMail({
        from: `"BJS Prep" <${env.SMTP_USER}>`,
        to,
        subject: "Reset your BJS Prep password",
        html: passwordResetTemplate(resetUrl, code),
        text: `Reset your BJS Prep password: ${resetUrl}\n\nYour reset code is ${code}. This link expires in 1 hour and can be used only once.`,
      }),
      TIMEOUTS.SMTP,
      "email",
    );
  } catch (error) {
    logger.warn("Email delivery timed out or failed", {
      label: "password_reset",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function registrationCodeTemplate(code: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f7f3ec;font-family:Arial,sans-serif;color:#14110c"><div style="max-width:560px;margin:32px auto;background:#fff"><div style="background:#12213f;padding:24px;color:#f7f3ec;font-size:22px;font-weight:700">BJS Prep</div><div style="padding:32px;text-align:center"><h1 style="margin:0 0 16px;color:#12213f">Verify your email</h1><p style="color:#6e6960;line-height:1.6">Enter this code to complete your registration:</p><div style="margin:24px 0;font-size:32px;letter-spacing:8px;font-weight:700;color:#12213f">${code}</div><p style="font-size:13px;color:#6e6960">This code expires in 1 hour.</p><p style="font-size:13px;color:#6e6960">If you didn't request this, ignore this email.</p></div></div></body></html>`;
}

function passwordResetTemplate(resetUrl: string, code: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f7f3ec;font-family:Arial,sans-serif;color:#14110c"><div style="max-width:560px;margin:32px auto;background:#fff"><div style="background:#12213f;padding:24px;color:#f7f3ec;font-size:22px;font-weight:700">BJS Prep</div><div style="padding:32px;text-align:center"><h1 style="margin:0 0 16px;color:#12213f">Reset your password</h1><p style="color:#6e6960;line-height:1.6">Use the button below to choose a new password.</p><a href="${resetUrl}" style="display:inline-block;margin-top:20px;background:#b87333;color:#f7f3ec;padding:13px 22px;text-decoration:none;font-weight:700">Reset Password</a><p style="margin-top:24px;font-size:13px;color:#6e6960">This link expires in 1 hour and can be used only once.</p><p style="font-size:13px;color:#6e6960">Your reset code: ${code}</p></div></div></body></html>`;
}
