import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { createServiceClient } from "@/lib/supabase/server";

interface SearchParams {
  page?: string;
  search?: string;
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createServiceClient();
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const search = params.search || "";

  let query = supabase
    .from("submissions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("email", `%${search}%`);
  }

  const {
    data: submissions,
    count,
    error,
  } = await query.range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching submissions:", error);
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <AdminLayout>
      <AdminHeader
        title="제출 관리"
        description="이메일 제출 내역을 조회하고 관리하세요"
      />
      <SubmissionsTable
        submissions={submissions || []}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count || 0}
        search={search}
      />
    </AdminLayout>
  );
}
