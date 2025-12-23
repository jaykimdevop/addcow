import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/clerk";
import { createServiceClient } from "@/lib/supabase/server";

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
    // User is authenticated but not in admin_users table
    console.error("Admin access denied:", {
      userId,
      error: error?.message,
      adminUser,
    });
    // Redirect to home with a message
    redirect("/");
  }

  return <>{children}</>;
}
