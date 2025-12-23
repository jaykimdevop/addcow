import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/clerk";
import { getSiteMode, setSiteMode } from "@/lib/site-settings";

export async function GET() {
  try {
    await requireAdminAuth();

    const mode = await getSiteMode();

    return NextResponse.json({ mode });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAdminAuth();

    const { mode } = await request.json();

    if (mode !== "faked_door" && mode !== "mvp") {
      return NextResponse.json(
        { error: "Invalid mode. Must be 'faked_door' or 'mvp'" },
        { status: 400 },
      );
    }

    await setSiteMode(mode, userId);

    return NextResponse.json({
      message: "Site mode updated successfully",
      mode,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
