/**
 * API 응답 타입 정의
 * 클라이언트와 서버 간 타입 안정성 보장
 */

/**
 * 공통 API 응답 타입
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Google Drive 관련 타입
 */
export interface DriveStatusResponse {
  connected: boolean;
  connectedAt?: string;
  email?: string;
  error?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
}

export interface DriveFilesResponse {
  files: DriveFile[];
  nextPageToken?: string;
  error?: string;
}

/**
 * Waitlist 관련 타입
 */
export interface WaitlistCountResponse {
  total: number;
  remaining: number;
  startDate: string;
  error?: string;
}

/**
 * Submission 관련 타입
 */
export interface SubmissionResponse {
  message: string;
  error?: string;
}

/**
 * Contact 관련 타입
 */
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  message: string;
  error?: string;
}

/**
 * Admin 관련 타입
 */
export interface AdminUser {
  id: string;
  clerk_user_id: string;
  role: "admin" | "viewer";
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  error?: string;
}

export interface StatsData {
  total: number;
  today: number;
  week: number;
  month: number;
}

export interface StatsResponse {
  stats: StatsData;
  error?: string;
}

/**
 * Site Settings 관련 타입
 */
export interface SiteMode {
  mode: "faked_door" | "mvp";
}

export interface SiteModeResponse {
  mode: "faked_door" | "mvp";
  error?: string;
}

/**
 * Auth 관련 타입
 */
export interface GoogleAuthInitResponse {
  authUrl: string;
  error?: string;
}

export interface GoogleAuthCallbackResponse {
  success: boolean;
  error?: string;
}
