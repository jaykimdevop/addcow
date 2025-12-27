import { checkIsAdmin } from "@/lib/clerk";
import { GlobalDock } from "@/components/GlobalDock";

/**
 * GlobalDock의 서버 컴포넌트 래퍼
 * 서버에서 관리자 권한을 확인하여 GlobalDock에 전달
 */
export async function GlobalDockWrapper() {
  const adminInfo = await checkIsAdmin();

  return (
    <GlobalDock
      initialIsAdmin={adminInfo?.isAdmin || false}
      initialRole={adminInfo?.role || null}
    />
  );
}
