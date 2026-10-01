import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton";

export default function AdminWrittenSubmissionsLoading() {
  return <AdminTableSkeleton hasFilters rows={10} cols={6} />;
}
