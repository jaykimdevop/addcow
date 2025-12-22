import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteGoogleDriveToken } from "@/lib/google-drive";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await deleteGoogleDriveToken(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting Google Drive:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google Drive" },
      { status: 500 }
    );
  }
}
