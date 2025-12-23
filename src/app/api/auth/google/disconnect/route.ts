import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteGoogleDriveToken } from "@/lib/google-drive";
import { createErrorResponse, logError } from "@/lib/errors";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        createErrorResponse("UNAUTHORIZED", 401),
        { status: 401 },
      );
    }

    await deleteGoogleDriveToken(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("google-drive:disconnect", error);
    return NextResponse.json(
      createErrorResponse("GOOGLE_DRIVE_DISCONNECT_FAILED", 500, error),
      { status: 500 },
    );
  }
}
