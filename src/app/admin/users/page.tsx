import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UsersTable } from "@/components/admin/UsersTable";
import { getClerkUser, requireAuth } from "@/lib/clerk";
import { createServiceClient } from "@/lib/supabase/server";

// 동적 렌더링 강제 (캐싱 방지)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UsersPage() {
  await requireAuth();
  const supabase = await createServiceClient();

  const { data: adminUsers, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin users:", error);
  }

  // Clerk 사용자 정보 가져오기 (Supabase에 저장된 정보가 없을 경우에만 API 호출)
  const usersWithClerkInfo = await Promise.all(
    (adminUsers || []).map(async (adminUser) => {
      // Supabase에 이미 사용자 정보가 모두 있으면 그것을 사용
      // image_url이 없으면 Clerk API에서 가져오기
      if (adminUser.email && adminUser.first_name && adminUser.image_url) {
        // 디버깅: image_url 값 확인
        if (!adminUser.image_url || adminUser.image_url.trim() === "") {
          console.log(
            `[UsersPage] User ${adminUser.clerk_user_id} has empty image_url, fetching from Clerk`,
          );
          // image_url이 비어있으면 Clerk API에서 가져오기
        } else {
          return {
            ...adminUser,
            clerkUser: {
              firstName: adminUser.first_name,
              lastName: adminUser.last_name,
              username: adminUser.username,
              emailAddress: adminUser.email,
              imageUrl: adminUser.image_url,
            },
          };
        }
      }

      // Supabase에 정보가 없으면 Clerk API에서 가져오기
      try {
        const clerkUser = await getClerkUser(adminUser.clerk_user_id);

        if (!clerkUser) {
          console.warn(
            `[UsersPage] Failed to fetch Clerk user for clerk_user_id: ${adminUser.clerk_user_id}`,
          );
          return {
            ...adminUser,
            clerkUser: null,
          };
        }

        // 가져온 정보를 Supabase에 저장 (다음번에는 Supabase에서 바로 사용)
        const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress || null;
        await supabase
          .from("admin_users")
          .update({
            first_name: clerkUser.firstName,
            last_name: clerkUser.lastName,
            username: clerkUser.username,
            email: primaryEmail,
            image_url: clerkUser.imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", adminUser.id);

        return {
          ...adminUser,
          clerkUser: {
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            username: clerkUser.username,
            emailAddress: primaryEmail,
            imageUrl: clerkUser.imageUrl,
          },
        };
      } catch (error) {
        console.error(
          `[UsersPage] Error processing user ${adminUser.clerk_user_id}:`,
          error,
        );
        return {
          ...adminUser,
          clerkUser: null,
        };
      }
    }),
  );

  return (
    <AdminLayout>
      <AdminHeader
        title="사용자 관리"
        description="관리자 사용자를 추가하고 관리하세요"
      />
      <UsersTable users={usersWithClerkInfo} />
    </AdminLayout>
  );
}
