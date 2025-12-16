import { createServiceClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/admin/StatsCards";
import { SubmissionsChart } from "@/components/admin/SubmissionsChart";
import { RecentSubmissions } from "@/components/admin/RecentSubmissions";

export default async function AdminDashboard() {
  const supabase = await createServiceClient();

  // Get total count
  const { count: totalCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true });

  // Get today's count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  // Get this week's count
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: weekCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  // Get this month's count
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const { count: monthCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthAgo.toISOString());

  // Get recent submissions
  const { data: recentSubmissions } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  // Get submissions for chart (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: chartData } = await supabase
    .from("submissions")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview of your waitlist submissions
        </p>
      </div>

      <StatsCards
        total={totalCount || 0}
        today={todayCount || 0}
        week={weekCount || 0}
        month={monthCount || 0}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <SubmissionsChart data={chartData || []} />
        <RecentSubmissions submissions={recentSubmissions || []} />
      </div>
    </div>
  );
}

