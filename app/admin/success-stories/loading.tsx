import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton";

export default function AdminSuccessStoriesLoading() {
  return <AdminTableSkeleton hasStats hasFilters rows={8} cols={6} />;
}
