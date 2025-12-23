import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { APP_URL } from "@/lib/constants";
import { logError } from "@/lib/errors";
import {
  exchangeCodeForTokens,
  saveGoogleDriveToken,
} from "@/lib/google-drive";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Google OAuth 에러 처리
    if (error) {
      logError("google-auth:callback", `OAuth error: ${error}`);
      return NextResponse.redirect(
        `${APP_URL}/settings?error=google_auth_failed`,
      );
    }

    // 필수 파라미터 체크
    if (!code || !state) {
      return NextResponse.redirect(
        `${APP_URL}/settings?error=missing_parameters`,
      );
    }

    // state에서 사용자 ID 추출 및 검증
    let userId: string;
    try {
      const decodedState = JSON.parse(
        Buffer.from(state, "base64").toString("utf-8"),
      );
      userId = decodedState.userId;

      if (!userId) {
        throw new Error("userId missing in state");
      }
    } catch (error) {
      logError("google-auth:callback:state", error);
      return NextResponse.redirect(`${APP_URL}/settings?error=invalid_state`);
    }

    // CSRF 보호: 현재 인증된 사용자와 state의 사용자 ID 일치 확인
    const { userId: currentUserId } = await auth();
    if (!currentUserId || currentUserId !== userId) {
      logError(
        "google-auth:callback:csrf",
        `User mismatch: ${currentUserId} vs ${userId}`,
      );
      return NextResponse.redirect(`${APP_URL}/settings?error=unauthorized`);
    }

    // OAuth 코드를 토큰으로 교환
    let tokens;
    try {
      tokens = await exchangeCodeForTokens(code);
    } catch (error) {
      logError("google-auth:callback:token_exchange", error);
      return NextResponse.redirect(`${APP_URL}/settings?error=connect_failed`);
    }

    // 토큰 만료 시간 계산
    const tokenExpiry = new Date(tokens.expiry_date).toISOString();

    // Supabase에 토큰 저장
    try {
      await saveGoogleDriveToken(
        userId,
        tokens.access_token,
        tokens.refresh_token,
        tokenExpiry,
      );
    } catch (error) {
      logError("google-auth:callback:save_token", error);
      return NextResponse.redirect(`${APP_URL}/settings?error=connect_failed`);
    }

    // 성공 시 settings 페이지로 리다이렉트
    return NextResponse.redirect(`${APP_URL}/settings?connected=true`);
  } catch (error) {
    logError("google-auth:callback", error);
    return NextResponse.redirect(`${APP_URL}/settings?error=connect_failed`);
  }
}
