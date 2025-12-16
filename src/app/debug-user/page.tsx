import { auth, currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";

export default async function DebugUserPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const supabase = await createServiceClient();

  let adminUser = null;
  let error = null;

  if (userId) {
    const result = await supabase
      .from("admin_users")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    adminUser = result.data;
    error = result.error;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          사용자 디버깅 정보
        </h1>

        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Clerk 인증 정보
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  User ID:
                </span>{" "}
                <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-sm">
                  {userId || "인증되지 않음"}
                </code>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Email:
                </span>{" "}
                <span className="text-gray-900 dark:text-gray-100">
                  {user?.emailAddresses[0]?.emailAddress || "없음"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Admin Users 테이블 확인
            </h2>
            {adminUser ? (
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Role:
                  </span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {adminUser.role}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Created At:
                  </span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {new Date(adminUser.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <p className="text-green-800 dark:text-green-200">
                    ✅ 관리자 권한이 있습니다. /admin 페이지에 접근할 수 있습니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚠️ admin_users 테이블에 사용자가 없습니다.
                  </p>
                  {error && (
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      에러: {error.message}
                    </p>
                  )}
                </div>

                {userId && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      해결 방법:
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      Supabase SQL Editor에서 다음 쿼리를 실행하세요:
                    </p>
                    <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                      {`INSERT INTO admin_users (clerk_user_id, role)
VALUES ('${userId}', 'admin');`}
                    </pre>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      또는 Clerk 대시보드에서 웹훅이 설정되어 있다면, 사용자를 생성하면 자동으로 추가됩니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
