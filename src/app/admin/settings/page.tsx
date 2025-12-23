import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminSection } from "@/components/admin/AdminSection";
import { SiteModeToggle } from "@/components/admin/SiteModeToggle";
import { VercelApiTest } from "@/components/admin/VercelApiTest";
import { LuSettings, LuServer } from "react-icons/lu";
import { getSiteMode } from "@/lib/site-settings";
import { createServiceClient } from "@/lib/supabase/server";

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
    <AdminLayout>
      <AdminHeader
        title="설정"
        description="사이트 모드 및 시스템 설정을 관리하세요"
      />
      <div className="space-y-4">
        <AdminSection
          title="사이트 모드"
          description="이메일 수집 모드와 MVP 모드를 전환합니다"
          icon={<LuSettings size={16} />}
          delay={0}
        >
          <SiteModeToggle currentMode={currentMode} />
        </AdminSection>

        <AdminSection
          title="Vercel API 테스트"
          description="Vercel API 연결 상태를 확인합니다"
          icon={<LuServer size={16} />}
          delay={0.05}
        >
          <VercelApiTest />
        </AdminSection>

        <AdminSection
          title="통계"
          description="대기자 및 알림 발송 현황을 확인합니다"
          delay={0.1}
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-700">
              <div className="text-lg font-bold text-white mb-1">
                {totalSubmissions || 0}
              </div>
              <div className="text-xs text-neutral-400">총 대기자 수</div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-700">
              <div className="text-lg font-bold text-white mb-1">
                {notifiedCount || 0}
              </div>
              <div className="text-xs text-neutral-400">알림 발송 완료</div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-700">
              <div className="text-lg font-bold text-white mb-1">
                {accountCreatedCount || 0}
              </div>
              <div className="text-xs text-neutral-400">계정 생성 완료</div>
            </div>
          </div>
        </AdminSection>
      </div>
    </AdminLayout>
  );
}
