import { redirect } from "next/navigation";

import { AdminShell } from "@/components/layout/admin-shell";
import { AdminShellProvider } from "@/components/layout/admin-shell-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard?forbidden=1");
  }

  return (
    <ThemeProvider>
      <AdminShellProvider>
        <AdminShell>{children}</AdminShell>
      </AdminShellProvider>
    </ThemeProvider>
  );
}
