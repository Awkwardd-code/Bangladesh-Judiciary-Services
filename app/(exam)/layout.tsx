import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";

export default function ExamLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">{children}</div>
    </ThemeProvider>
  );
}
