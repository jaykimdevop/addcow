import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/clerk";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, supabase } = await requireAdminAuth();
    const { id } = await params;

    // Prevent self-deletion
    const { data: targetUser } = await supabase
      .from("admin_users")
      .select("clerk_user_id")
      .eq("id", id)
      .single();

    if (targetUser?.clerk_user_id === userId) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("admin_users").delete().eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
