import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register — BJS Prep",
  description: "Create your BJS Prep account.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
