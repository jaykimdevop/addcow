import { createServiceClient } from "@/lib/supabase/server";
import { UsersTable } from "@/components/admin/UsersTable";

export default async function UsersPage() {
  const supabase = await createServiceClient();

  const { data: adminUsers, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin users:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage admin users and their roles
        </p>
      </div>

      <UsersTable users={adminUsers || []} />
    </div>
  );
}

