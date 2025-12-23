import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getGoogleDriveToken } from "@/lib/google-drive";
import { createErrorResponse, logError } from "@/lib/errors";
import type { DriveStatusResponse } from "@/types/api";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        createErrorResponse("UNAUTHORIZED", 401),
        { status: 401 },
      );
    }

    const tokenData = await getGoogleDriveToken(userId);

    if (!tokenData) {
      return NextResponse.json<DriveStatusResponse>({ connected: false });
    }

    return NextResponse.json<DriveStatusResponse>({
      connected: true,
      connectedAt: tokenData.created_at,
    });
  } catch (error) {
    logError("google-drive:status", error);
    return NextResponse.json(
      createErrorResponse("GOOGLE_DRIVE_STATUS_CHECK_FAILED", 500, error),
      { status: 500 },
    );
  }
}
