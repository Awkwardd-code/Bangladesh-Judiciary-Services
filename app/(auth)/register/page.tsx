import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register — LegalPath Bangladesh",
  description: "Create your LegalPath Bangladesh account.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
