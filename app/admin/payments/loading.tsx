import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton";

export default function AdminPaymentsLoading() {
  return <AdminTableSkeleton hasStats hasFilters rows={10} cols={7} />;
}
