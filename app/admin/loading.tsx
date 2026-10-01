import { BookLoader } from "@/components/loading/book-loader";

// NOTE: Skipped these loading paths because their page routes do not exist:
// - app/admin/about/loading.tsx
// - app/admin/seed/loading.tsx
// - app/(public)/courses/[slug]/loading.tsx
export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BookLoader compact />
    </div>
  );
}
