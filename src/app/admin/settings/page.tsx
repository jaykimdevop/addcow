import { createServiceClient } from "@/lib/supabase/server";
import { getSiteMode } from "@/lib/site-settings";
import { SiteModeToggle } from "@/components/admin/SiteModeToggle";
import { VercelApiTest } from "@/components/admin/VercelApiTest";

export default async function SettingsPage() {
  const supabase = await createServiceClient();
  const currentMode = await getSiteMode();

  // Get statistics
  const { count: totalSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true });

  const { count: notifiedCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("notified", true);

  const { count: accountCreatedCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("account_created", true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          사이트 설정
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          사이트 모드를 관리하고 MVP 전환을 수행하세요
        </p>
      </div>

      <SiteModeToggle currentMode={currentMode} />

      {/* Vercel API Test */}
      <VercelApiTest />

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {totalSubmissions || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            총 대기자 수
          </div>
        </div>

        <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {notifiedCount || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            알림 발송 완료
          </div>
        </div>

        <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {accountCreatedCount || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            계정 생성 완료
          </div>
        </div>
      </div>
    </div>
  );
}

