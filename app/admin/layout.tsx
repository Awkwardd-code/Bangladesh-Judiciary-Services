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
    if (process.env.NODE_ENV !== "production") {
      console.warn("[admin-layout] redirecting to login: no valid admin session");
    }
    redirect("/login?next=/admin");
  }

  return (
    <ThemeProvider>
      <AdminShellProvider>
        <AdminShell>{children}</AdminShell>
      </AdminShellProvider>
    </ThemeProvider>
  );
}
