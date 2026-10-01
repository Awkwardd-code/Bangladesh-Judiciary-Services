import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton";

export default function AdminEnrollmentsLoading() {
  return <AdminTableSkeleton hasStats hasFilters rows={10} cols={6} />;
}
