import { redirect } from "next/navigation";

import { AdminShell } from "@/components/layout/admin-shell";
import { AdminShellProvider } from "@/components/layout/admin-shell-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { requireSession } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (!session) {
    redirect("/login?next=/admin&session=invalid");
  }

  if (session.role !== "admin" || session.isAdmin !== 1) {
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
