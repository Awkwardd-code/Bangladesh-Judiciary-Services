import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton";

export default function AdminMentorsLoading() {
  return <AdminTableSkeleton hasFilters rows={8} cols={6} />;
}
