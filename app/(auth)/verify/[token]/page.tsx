import type { Metadata } from "next";

import { VerifyCard } from "@/components/auth/verify-card";

export const metadata: Metadata = {
  title: "Verify Email — BJS Prep",
};

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <VerifyCard token={token} />;
}
