import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { UsersTable } from "@/components/admin/UsersTable";
import { AddUserForm } from "@/components/admin/AddUserForm";
import { getClerkUser, requireAuth } from "@/lib/clerk";
import { createServiceClient } from "@/lib/supabase/server";
import { ManageTabs } from "@/components/admin/ManageTabs";

interface SearchParams {
  page?: string;
  tab?: string;
}

// 동적 렌더링 강제 (캐싱 방지)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth();
  const supabase = await createServiceClient();
  const params = await searchParams;
  const tab = params.tab || "submissions";
  const page = parseInt(params.page || "1", 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // 제출 데이터 가져오기
  const submissionsQuery = supabase
    .from("submissions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const {
    data: submissions,
    count: submissionsCount,
    error: submissionsError,
  } = await submissionsQuery.range(offset, offset + pageSize - 1);

  if (submissionsError) {
    console.error("Error fetching submissions:", submissionsError);
  }

  const totalPages = submissionsCount
    ? Math.ceil(submissionsCount / pageSize)
    : 0;

  // 사용자 데이터 가져오기
  const { data: adminUsers, error: usersError } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (usersError) {
    console.error("Error fetching admin users:", usersError);
  }

  // Clerk 사용자 정보 가져오기
  const usersWithClerkInfo = await Promise.all(
    (adminUsers || []).map(async (adminUser) => {
      if (adminUser.email && adminUser.first_name && adminUser.image_url) {
        if (!adminUser.image_url || adminUser.image_url.trim() === "") {
          console.log(
            `[UsersPage] User ${adminUser.clerk_user_id} has empty image_url, fetching from Clerk`,
          );
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

        const primaryEmail =
          clerkUser.emailAddresses[0]?.emailAddress || null;
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
        title="사용자"
        description="제출 내역과 사용자를 한 곳에서 관리하세요"
      />
      <ManageTabs
        currentTab={tab}
        submissions={
          <SubmissionsTable
            submissions={submissions || []}
            currentPage={page}
            totalPages={totalPages}
            totalCount={submissionsCount || 0}
          />
        }
        users={<UsersTable users={usersWithClerkInfo} />}
        addUser={<AddUserForm />}
      />
    </AdminLayout>
  );
}

