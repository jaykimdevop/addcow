import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { APP_URL } from "@/lib/constants";
import { requireEnvVars } from "@/lib/env";
import { logError } from "@/lib/errors";
import { getGoogleAuthUrl } from "@/lib/google-drive";

export async function GET() {
  try {
    // 환경변수 검증
    requireEnvVars([
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_REDIRECT_URI",
    ]);

    const { userId } = await auth();

    if (!userId) {
      const errorUrl = new URL("/settings", APP_URL);
      errorUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(errorUrl);
    }

    // CSRF 보호를 위해 state에 사용자 ID 포함
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");
    const authUrl = getGoogleAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    logError("google-auth:init", error);
    const errorUrl = new URL("/settings", APP_URL);
    errorUrl.searchParams.set("error", "google_auth_failed");
    return NextResponse.redirect(errorUrl);
  }
}
