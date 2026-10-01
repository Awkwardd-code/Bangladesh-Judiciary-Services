import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password — BJS Prep",
  description: "Reset your BJS Prep account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
