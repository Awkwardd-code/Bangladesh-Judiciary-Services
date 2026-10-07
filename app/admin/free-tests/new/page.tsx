import { redirect } from "next/navigation";

import { FreeTestEditor } from "@/components/admin/free-test-editor";
import { requireAdmin } from "@/lib/auth-guard";

export default async function NewFreeTestPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/login");
  }

  return <FreeTestEditor />;
}
