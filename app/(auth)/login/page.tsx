import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login — BJS Prep",
  description: "Login to continue your BJS preparation.",
};

export default function LoginPage() {
  return <LoginForm />;
}
