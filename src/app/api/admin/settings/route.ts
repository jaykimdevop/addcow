import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/clerk";
import { createServiceClient } from "@/lib/supabase/server";
import { setSiteMode, getSiteMode } from "@/lib/site-settings";

export async function GET() {
  try {
    const userId = await requireAuth();
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

    const mode = await getSiteMode();

    return NextResponse.json({ mode });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
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

    const { mode } = await request.json();

    if (mode !== "faked_door" && mode !== "mvp") {
      return NextResponse.json(
        { error: "Invalid mode. Must be 'faked_door' or 'mvp'" },
        { status: 400 }
      );
    }

    await setSiteMode(mode, userId);

    return NextResponse.json({ message: "Site mode updated successfully", mode });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

