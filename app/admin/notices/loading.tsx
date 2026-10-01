import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton";

export default function AdminNoticesLoading() {
  return <AdminTableSkeleton hasFilters rows={8} cols={5} />;
}
