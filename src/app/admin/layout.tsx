import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/clerk";
import { createServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireAuth();
  const supabase = await createServiceClient();

  // Check if user is admin
  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !adminUser) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav role={adminUser.role} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

