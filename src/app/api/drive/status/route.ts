import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleDriveToken } from "@/lib/google-drive";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tokenData = await getGoogleDriveToken(userId);

    if (!tokenData) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      connectedAt: tokenData.created_at,
    });
  } catch (error) {
    console.error("Error checking Google Drive status:", error);
    return NextResponse.json(
      { error: "Failed to check Google Drive status" },
      { status: 500 }
    );
  }
}
