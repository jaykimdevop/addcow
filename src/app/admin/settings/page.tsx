import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminSection } from "@/components/admin/AdminSection";
import { DockSettingsSection } from "@/components/admin/DockSettingsSection";
import { SiteModeToggle } from "@/components/admin/SiteModeToggle";
import { getSiteMode } from "@/lib/site-settings";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/clerk";

export default async function SettingsPage() {
  const userId = await requireAuth();
  const supabase = await createServiceClient();
  const currentMode = await getSiteMode();

  // Get admin role
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("clerk_user_id", userId)
    .single();

  return (
    <AdminLayout>
      <AdminHeader
        title="설정"
        description="사이트 모드 및 시스템 설정을 관리하세요"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-min">
        <AdminSection
          delay={0}
        >
          <SiteModeToggle currentMode={currentMode} />
        </AdminSection>

        {adminUser?.role === "admin" && (
          <DockSettingsSection delay={0.05} />
        )}
      </div>
    </AdminLayout>
  );
}
