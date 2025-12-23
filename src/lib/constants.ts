/**
 * 앱 전체에서 사용되는 상수 정의
 * 환경변수 중복 사용 방지
 */

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Rate Limiting 설정
 */
export const RATE_LIMIT = {
  // 일반 API (제출, 문의 등)
  SUBMISSIONS: {
    requests: 5,
    window: "1 m", // 1분
  },
  CONTACT: {
    requests: 3,
    window: "1 m",
  },
  // 인증 관련
  AUTH: {
    requests: 10,
    window: "5 m", // 5분
  },
  // 조회성 API
  READ: {
    requests: 30,
    window: "1 m",
  },
} as const;

/**
 * Google Drive 설정
 */
export const GOOGLE_DRIVE = {
  SCOPES: [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
  ],
} as const;

/**
 * Waitlist 설정
 */
export const WAITLIST = {
  MAX_COUNT: 300,
  UPDATE_INTERVAL: 60000, // 1분 (ms)
} as const;
