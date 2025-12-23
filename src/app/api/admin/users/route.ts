import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/clerk";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdminAuth();

    const { clerk_user_id, role } = await request.json();

    if (!clerk_user_id || !role) {
      return NextResponse.json(
        { error: "clerk_user_id and role are required" },
        { status: 400 },
      );
    }

    if (role !== "admin" && role !== "viewer") {
      return NextResponse.json(
        { error: "role must be 'admin' or 'viewer'" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        clerk_user_id,
        role,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 },
        );
      }
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
