import { google } from "googleapis";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import type { GoogleDriveTokenData } from "@/types/google-drive";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];

/**
 * Google OAuth2 클라이언트 생성
 */
export function createGoogleOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI environment variables."
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Google OAuth 인증 URL 생성
 */
export function getGoogleAuthUrl(state: string): string {
  const oauth2Client = createGoogleOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state,
    prompt: "consent", // 리프레시 토큰을 받기 위해 필요
  });
}

/**
 * OAuth 코드를 액세스 토큰으로 교환
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}> {
  const oauth2Client = createGoogleOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error("Failed to get tokens from Google OAuth");
  }

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000, // 기본 1시간
  };
}

/**
 * 토큰 만료 확인
 */
export function isTokenExpired(tokenExpiry: string): boolean {
  const expiryDate = new Date(tokenExpiry);
  const now = new Date();
  // 만료 5분 전을 만료로 간주
  return expiryDate.getTime() - now.getTime() < 5 * 60 * 1000;
}

/**
 * 리프레시 토큰으로 새 액세스 토큰 발급
 */
export async function refreshGoogleToken(
  refreshToken: string
): Promise<{
  access_token: string;
  expiry_date: number;
}> {
  const oauth2Client = createGoogleOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error("Failed to refresh access token");
  }

  return {
    access_token: credentials.access_token,
    expiry_date: credentials.expiry_date || Date.now() + 3600 * 1000,
  };
}

/**
 * Supabase에서 사용자의 Google Drive 토큰 조회
 */
export async function getGoogleDriveToken(
  clerkUserId: string
): Promise<GoogleDriveTokenData | null> {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from("google_drive_tokens")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as GoogleDriveTokenData;
}

/**
 * Google Drive 토큰 저장 또는 업데이트
 */
export async function saveGoogleDriveToken(
  clerkUserId: string,
  accessToken: string,
  refreshToken: string,
  tokenExpiry: string
): Promise<void> {
  const supabase = await createClerkSupabaseClient();
  const { error } = await supabase
    .from("google_drive_tokens")
    .upsert(
      {
        clerk_user_id: clerkUserId,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expiry: tokenExpiry,
      },
      {
        onConflict: "clerk_user_id",
      }
    );

  if (error) {
    throw new Error(`Failed to save Google Drive token: ${error.message}`);
  }
}

/**
 * Google Drive 토큰 삭제
 */
export async function deleteGoogleDriveToken(
  clerkUserId: string
): Promise<void> {
  const supabase = await createClerkSupabaseClient();
  const { error } = await supabase
    .from("google_drive_tokens")
    .delete()
    .eq("clerk_user_id", clerkUserId);

  if (error) {
    throw new Error(`Failed to delete Google Drive token: ${error.message}`);
  }
}

/**
 * 인증된 Google Drive API 클라이언트 반환
 * 토큰이 만료된 경우 자동으로 리프레시
 */
export async function getGoogleDriveClient() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const tokenData = await getGoogleDriveToken(userId);
  if (!tokenData) {
    throw new Error("Google Drive not connected");
  }

  let accessToken = tokenData.access_token;
  let tokenExpiry = tokenData.token_expiry;

  // 토큰 만료 확인 및 리프레시
  if (isTokenExpired(tokenExpiry)) {
    const refreshed = await refreshGoogleToken(tokenData.refresh_token);
    accessToken = refreshed.access_token;
    tokenExpiry = new Date(refreshed.expiry_date).toISOString();

    // 새 토큰 저장
    await saveGoogleDriveToken(
      userId,
      accessToken,
      tokenData.refresh_token,
      tokenExpiry
    );
  }

  const oauth2Client = createGoogleOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: tokenData.refresh_token,
  });

  return google.drive({ version: "v3", auth: oauth2Client });
}
