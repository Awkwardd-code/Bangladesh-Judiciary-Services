import { BookLoader } from "@/components/loading/book-loader";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BookLoader compact />
    </div>
  );
}
