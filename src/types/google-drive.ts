// Google Drive API 타입 정의

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
}

export interface GoogleDriveFileListResponse {
  files: GoogleDriveFile[];
  nextPageToken?: string;
}

export interface GoogleDriveTokenData {
  id: string;
  clerk_user_id: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  created_at: string;
  updated_at: string;
}
