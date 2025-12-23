import { checkIsAdmin } from "@/lib/clerk";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const adminCheck = await checkIsAdmin();
    return NextResponse.json({
      isAdmin: adminCheck?.isAdmin || false,
      role: adminCheck?.role || null,
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { isAdmin: false, role: null },
      { status: 500 },
    );
  }
}
