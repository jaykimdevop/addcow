/**
 * 에러 메시지 통일 관리
 * 사용자에게 표시되는 모든 에러 메시지를 한국어로 통일
 */

export const ERROR_MESSAGES = {
  // 인증 관련
  AUTH_REQUIRED: "로그인이 필요합니다",
  AUTH_FAILED: "인증에 실패했습니다",
  UNAUTHORIZED: "권한이 없습니다",
  ADMIN_ONLY: "관리자 권한이 필요합니다",

  // 이메일 관련
  EMAIL_REQUIRED: "이메일을 입력해주세요",
  EMAIL_INVALID: "올바른 이메일 형식이 아닙니다",
  EMAIL_DUPLICATE: "이미 등록된 이메일입니다",

  // 필드 검증
  FIELD_REQUIRED: "필수 입력 항목입니다",
  ALL_FIELDS_REQUIRED: "모든 항목을 입력해주세요",

  // Google OAuth
  GOOGLE_AUTH_INIT_FAILED: "구글 로그인을 시작할 수 없습니다",
  GOOGLE_AUTH_CALLBACK_FAILED: "구글 로그인 처리 중 오류가 발생했습니다",
  GOOGLE_AUTH_MISSING_PARAMS: "필수 파라미터가 누락되었습니다",
  GOOGLE_AUTH_INVALID_STATE: "잘못된 인증 요청입니다",
  GOOGLE_DRIVE_CONNECT_FAILED: "Google Drive 연결에 실패했습니다",
  GOOGLE_DRIVE_DISCONNECT_FAILED: "Google Drive 연결 해제에 실패했습니다",
  GOOGLE_DRIVE_STATUS_CHECK_FAILED: "Google Drive 상태 확인에 실패했습니다",
  GOOGLE_DRIVE_FILES_FETCH_FAILED:
    "Google Drive 파일 목록을 가져올 수 없습니다",

  // 데이터베이스
  DB_ERROR: "데이터베이스 오류가 발생했습니다",
  DB_SAVE_FAILED: "저장에 실패했습니다",
  DB_UPDATE_FAILED: "업데이트에 실패했습니다",
  DB_DELETE_FAILED: "삭제에 실패했습니다",

  // 일반
  INTERNAL_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다",
  RATE_LIMIT_EXCEEDED:
    "너무 많은 요청을 보내셨습니다. 잠시 후 다시 시도해주세요",

  // 기타
  INVALID_REQUEST: "잘못된 요청입니다",
  NOT_FOUND: "찾을 수 없습니다",
  CONTACT_SEND_FAILED: "문의 전송에 실패했습니다",
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

/**
 * 개발 환경에서만 상세 에러 로그 출력
 */
export function logError(context: string, error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, error);
  } else {
    // 프로덕션에서는 에러 메시지만 로그
    console.error(
      `[${context}]`,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

/**
 * API 에러 응답 생성 헬퍼
 */
export function createErrorResponse(
  messageKey: ErrorMessageKey,
  status: number = 500,
  devDetails?: unknown,
) {
  const response = {
    error: ERROR_MESSAGES[messageKey],
  };

  // 개발 환경에서만 상세 정보 포함
  if (process.env.NODE_ENV === "development" && devDetails) {
    return {
      ...response,
      details: devDetails,
    };
  }

  return response;
}

/**
 * 클라이언트용 에러 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return ERROR_MESSAGES.INTERNAL_ERROR;
}

/**
 * URL 파라미터의 에러 코드를 한국어 메시지로 변환
 */
export function parseUrlError(errorCode: string | null): string | null {
  if (!errorCode) return null;

  const errorMap: Record<string, string> = {
    missing_parameters: ERROR_MESSAGES.GOOGLE_AUTH_MISSING_PARAMS,
    invalid_state: ERROR_MESSAGES.GOOGLE_AUTH_INVALID_STATE,
    google_auth_failed: ERROR_MESSAGES.GOOGLE_AUTH_CALLBACK_FAILED,
    connect_failed: ERROR_MESSAGES.GOOGLE_DRIVE_CONNECT_FAILED,
    connection_failed: ERROR_MESSAGES.GOOGLE_DRIVE_CONNECT_FAILED,
    unauthorized: ERROR_MESSAGES.UNAUTHORIZED,
  };

  return errorMap[errorCode] || ERROR_MESSAGES.INTERNAL_ERROR;
}
