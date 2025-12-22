import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleAuthUrl } from "@/lib/google-drive";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // CSRF 보호를 위해 state에 사용자 ID 포함
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");
    const authUrl = getGoogleAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google OAuth" },
      { status: 500 }
    );
  }
}
