import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SeedClient } from "@/components/admin/seed-client";
import { requireAdmin } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Seed — Admin — LegalPath Bangladesh",
};

export const dynamic = "force-dynamic";

export default async function AdminSeedPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/login?next=/admin/seed");
  }

  return <SeedClient />;
}
