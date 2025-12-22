import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { exchangeCodeForTokens, saveGoogleDriveToken } from "@/lib/google-drive";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?error=missing_parameters`
      );
    }

    // state에서 사용자 ID 추출
    let userId: string;
    try {
      const decodedState = JSON.parse(
        Buffer.from(state, "base64").toString("utf-8")
      );
      userId = decodedState.userId;
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?error=invalid_state`
      );
    }

    // 현재 인증된 사용자와 state의 사용자 ID 일치 확인
    const { userId: currentUserId } = await auth();
    if (!currentUserId || currentUserId !== userId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?error=unauthorized`
      );
    }

    // OAuth 코드를 토큰으로 교환
    const tokens = await exchangeCodeForTokens(code);

    // 토큰 만료 시간 계산
    const tokenExpiry = new Date(tokens.expiry_date).toISOString();

    // Supabase에 토큰 저장
    await saveGoogleDriveToken(
      userId,
      tokens.access_token,
      tokens.refresh_token,
      tokenExpiry
    );

    // 성공 시 settings 페이지로 리다이렉트
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?connected=true`
    );
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?error=connection_failed`
    );
  }
}
