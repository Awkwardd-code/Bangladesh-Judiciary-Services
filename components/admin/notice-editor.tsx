"use client";

import type { Notice } from "@/lib/types/notice";

export function NoticeEditor({
  notice,
  onSaved,
}: {
  notice?: Notice;
  onSaved: () => void;
}) {
  void notice;
  void onSaved;
  return null;
}
