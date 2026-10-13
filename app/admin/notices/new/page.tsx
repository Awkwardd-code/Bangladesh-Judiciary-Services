import type { Metadata } from "next";

import { NoticeEditor } from "@/components/admin/notice-editor";
import { requireAdmin } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "New Notice — Admin — LegalPath Bangladesh",
};

export default async function NewNoticePage() {
  const session = await requireAdmin();
  if (!session) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <NoticeEditor notice={null} />
    </div>
  );
}
