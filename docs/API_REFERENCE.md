# API 레퍼런스

이 문서는 Faked Door 프로젝트의 모든 API 엔드포인트를 설명합니다.

## Base URL

- **개발**: `http://localhost:3000`
- **프로덕션**: `https://your-domain.com`

## 인증

대부분의 관리자 API는 Clerk 인증이 필요합니다. 인증되지 않은 요청은 401 Unauthorized를 반환합니다.

일부 엔드포인트는 추가로 관리자 권한(`admin` role)이 필요합니다.

## Public API

### POST /api/submissions

이메일 주소를 제출합니다.

**인증**: 불필요

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (201 Created):
```json
{
  "message": "Email submitted successfully"
}
```

**Error Responses**:
- `400 Bad Request`: 이메일 형식이 올바르지 않음
- `409 Conflict`: 이미 등록된 이메일
- `500 Internal Server Error`: 서버 오류

**Example**:
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## Admin API

### GET /api/admin/users

관리자 사용자 목록을 조회합니다.

**인증**: 필요 (관리자 권한)

**Response** (200 OK):
```json
[
  {
    "id": "uuid",
    "clerk_user_id": "user_xxx",
    "role": "admin",
    "created_at": "2025-12-16T00:00:00Z"
  }
]
```

### POST /api/admin/users

새 관리자 사용자를 추가합니다.

**인증**: 필요 (admin 권한)

**Request Body**:
```json
{
  "clerk_user_id": "user_xxx",
  "role": "admin"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "clerk_user_id": "user_xxx",
  "role": "admin",
  "created_at": "2025-12-16T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: 필수 필드 누락 또는 잘못된 role
- `403 Forbidden`: 권한 없음
- `409 Conflict`: 사용자가 이미 존재함
- `500 Internal Server Error`: 서버 오류

### DELETE /api/admin/users/[id]

관리자 사용자를 삭제합니다.

**인증**: 필요 (admin 권한)

**Path Parameters**:
- `id`: 관리자 사용자 UUID

**Response** (200 OK):
```json
{
  "message": "User deleted successfully"
}
```

**Error Responses**:
- `400 Bad Request`: 자신을 삭제하려고 시도
- `403 Forbidden`: 권한 없음
- `500 Internal Server Error`: 서버 오류

### GET /api/admin/export

제출 데이터를 CSV 형식으로 내보냅니다.

**인증**: 필요 (admin 권한)

**Query Parameters**:
- `start` (optional): 시작 날짜 (YYYY-MM-DD)
- `end` (optional): 종료 날짜 (YYYY-MM-DD)

**Response** (200 OK):
```
Content-Type: text/csv
Content-Disposition: attachment; filename="submissions-2025-12-01-to-2025-12-16.csv"

Email,Submitted At,ID
user@example.com,2025-12-16 10:00:00,uuid
```

**Example**:
```bash
curl -X GET "http://localhost:3000/api/admin/export?start=2025-12-01&end=2025-12-16" \
  -H "Authorization: Bearer <token>" \
  -o submissions.csv
```

## Webhook API

### POST /api/webhooks/clerk

Clerk 웹훅을 처리합니다.

**인증**: 웹훅 서명 검증 (CLERK_WEBHOOK_SECRET)

**Headers**:
- `svix-id`: 웹훅 ID
- `svix-timestamp`: 타임스탬프
- `svix-signature`: 서명

**Request Body**: Clerk 웹훅 페이로드

**Response** (200 OK):
```json
{
  "received": true
}
```

**Error Responses**:
- `400 Bad Request`: 서명 검증 실패 또는 필수 헤더 누락
- `500 Internal Server Error`: 서버 오류

**지원하는 이벤트**:
- `user.created`: 사용자 생성
- `user.deleted`: 사용자 삭제

**Example** (Clerk에서 자동으로 전송):
```json
{
  "type": "user.created",
  "data": {
    "id": "user_xxx",
    "email_addresses": [
      {
        "email_address": "user@example.com"
      }
    ]
  }
}
```

## 에러 응답 형식

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "error": "Error message"
}
```

## 상태 코드

- `200 OK`: 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `409 Conflict`: 리소스 충돌 (예: 중복 이메일)
- `500 Internal Server Error`: 서버 오류

## Rate Limiting

현재는 Rate Limiting이 구현되어 있지 않습니다. 프로덕션 환경에서는 Vercel의 기본 Rate Limiting이 적용됩니다.

## CORS

API 엔드포인트는 동일 출처 정책을 따릅니다. 필요시 CORS 설정을 추가할 수 있습니다.

## 버전 관리

현재 API 버전은 명시적으로 관리되지 않습니다. 향후 필요시 `/api/v1/` 같은 버전 경로를 추가할 수 있습니다.

