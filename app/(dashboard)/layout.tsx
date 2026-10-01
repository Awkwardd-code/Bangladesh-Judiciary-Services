import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardShellProvider } from "@/components/layout/dashboard-shell-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { requireSession } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (!session) {
    redirect("/login?next=/dashboard&session=invalid");
  }

  return (
    <ThemeProvider>
      <DashboardShellProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardShellProvider>
    </ThemeProvider>
  );
}
