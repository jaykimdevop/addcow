import { createServiceClient } from "@/lib/supabase/server";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";

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

  const { data: submissions, count, error } = await query
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching submissions:", error);
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Submissions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and manage all email submissions
        </p>
      </div>

      <SubmissionsTable
        submissions={submissions || []}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count || 0}
        search={search}
      />
    </div>
  );
}

