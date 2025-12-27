import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RecentSubmissions } from "@/components/admin/RecentSubmissions";
import { StatsCards } from "@/components/admin/StatsCards";
import { SubmissionsChart } from "@/components/admin/SubmissionsChart";
import { createServiceClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createServiceClient();

  // 날짜 계산
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 모든 쿼리를 병렬로 실행
  const [
    { count: totalCount },
    { count: todayCount },
    { count: weekCount },
    { count: monthCount },
    { data: recentSubmissions },
    { data: chartData },
  ] = await Promise.all([
    supabase.from("submissions").select("*", { count: "exact", head: true }),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString()),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthAgo.toISOString()),
    supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("submissions")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
  ]);

  return (
    <AdminLayout>
      <AdminHeader
        title="대시보드"
        description="사이트 통계 및 최근 제출 내역을 확인하세요"
      />
      <div className="space-y-4">
        <StatsCards
          total={totalCount || 0}
          today={todayCount || 0}
          week={weekCount || 0}
          month={monthCount || 0}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SubmissionsChart data={chartData || []} />
          <RecentSubmissions submissions={recentSubmissions || []} />
        </div>
      </div>
    </AdminLayout>
  );
}
