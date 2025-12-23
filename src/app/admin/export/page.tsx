import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminSection } from "@/components/admin/AdminSection";
import { ExportForm } from "@/components/admin/ExportForm";
import { LuFileDown } from "react-icons/lu";

export default async function ExportPage() {
  return (
    <AdminLayout>
      <AdminHeader
        title="데이터 내보내기"
        description="제출 데이터를 CSV 파일로 내보냅니다"
      />
      <AdminSection
        title="CSV 내보내기"
        description="날짜 범위를 선택하여 제출 데이터를 내보냅니다"
        icon={<LuFileDown size={16} />}
        delay={0}
      >
        <ExportForm />
      </AdminSection>
    </AdminLayout>
  );
}
