import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/clerk";
import { createServiceClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id } = await params;
    const supabase = await createServiceClient();

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role")
      .eq("clerk_user_id", userId)
      .single();

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prevent self-deletion
    const { data: targetUser } = await supabase
      .from("admin_users")
      .select("clerk_user_id")
      .eq("id", id)
      .single();

    if (targetUser?.clerk_user_id === userId) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

