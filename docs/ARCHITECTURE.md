# 아키텍처 문서

이 문서는 Faked Door 프로젝트의 아키텍처와 시스템 설계를 설명합니다.

## 시스템 개요

Faked Door는 Next.js 기반의 풀스택 웹 애플리케이션으로, faked door 테스트를 위한 랜딩 페이지와 관리자 대시보드를 제공합니다.

## 기술 스택

### Frontend
- **Framework**: Next.js 16.0.10 (App Router)
- **UI Library**: React 19.2.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: react-icons
- **Charts**: recharts

### Backend
- **Runtime**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Webhook Verification**: svix

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase
- **Analytics**: Google Analytics 4, Google Tag Manager

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 (브라우저)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 애플리케이션                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   홈페이지    │  │  관리자 페이지 │  │   API Routes  │    │
│  │  (이메일 수집) │  │  (대시보드)   │  │  (서버 로직)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              미들웨어 (인증 보호)                      │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase   │ │    Clerk     │ │  GA4/GTM     │
│  (PostgreSQL)│ │  (인증/웹훅)  │ │  (분석)      │
└──────────────┘ └──────────────┘ └──────────────┘
```

## 데이터 흐름

### 1. 이메일 수집 흐름

```
사용자 입력
    │
    ▼
EmailCollector 컴포넌트
    │
    ▼
POST /api/submissions
    │
    ▼
Supabase (submissions 테이블)
    │
    ▼
성공 응답
    │
    ▼
GA4 이벤트 트래킹
```

### 2. 관리자 인증 흐름

```
사용자 접근 /admin
    │
    ▼
Clerk 미들웨어
    │
    ├─ 인증되지 않음 → /sign-in 리다이렉트
    │
    └─ 인증됨 → admin_users 테이블 확인
            │
            ├─ 관리자 아님 → 접근 거부
            │
            └─ 관리자 → 페이지 렌더링
```

### 3. 웹훅 처리 흐름

```
Clerk 이벤트 발생
    │
    ▼
POST /api/webhooks/clerk
    │
    ▼
서명 검증 (svix)
    │
    ├─ 검증 실패 → 400 에러
    │
    └─ 검증 성공 → 이벤트 처리
            │
            ├─ webhook_events 테이블에 로깅
            │
            ├─ 이벤트 타입별 처리
            │   ├─ user.created → admin_users에 추가
            │   └─ user.deleted → admin_users에서 제거
            │
            └─ 알림 전송 (선택사항)
```

## 데이터베이스 스키마

### submissions 테이블
사용자가 제출한 이메일 주소를 저장합니다.

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);
```

**RLS 정책**:
- INSERT: 모든 사용자 허용 (이메일 수집용)
- SELECT: 관리자만 허용

### admin_users 테이블
관리자 권한을 관리합니다. Clerk user_id와 연결됩니다.

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE
);
```

**RLS 정책**:
- 모든 작업: 관리자만 허용

**역할**:
- `admin`: 모든 권한 (사용자 관리, 데이터 내보내기 등)
- `viewer`: 조회만 가능

### webhook_events 테이블
웹훅 이벤트를 로깅합니다.

```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE
);
```

**RLS 정책**:
- INSERT: Service Role만 허용 (웹훅 엔드포인트용)
- SELECT: 관리자만 허용

## API 엔드포인트

### Public API

#### POST /api/submissions
이메일 제출을 처리합니다.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "message": "Email submitted successfully"
}
```

### Admin API

#### GET /api/admin/users
관리자 사용자 목록을 조회합니다. (인증 필요)

#### POST /api/admin/users
새 관리자를 추가합니다. (admin 권한 필요)

**Request**:
```json
{
  "clerk_user_id": "user_xxx",
  "role": "admin"
}
```

#### DELETE /api/admin/users/[id]
관리자를 삭제합니다. (admin 권한 필요)

#### GET /api/admin/export
제출 데이터를 CSV로 내보냅니다. (admin 권한 필요)

**Query Parameters**:
- `start`: 시작 날짜 (YYYY-MM-DD)
- `end`: 종료 날짜 (YYYY-MM-DD)

### Webhook API

#### POST /api/webhooks/clerk
Clerk 웹훅을 처리합니다.

**Headers**:
- `svix-id`: 웹훅 ID
- `svix-timestamp`: 타임스탬프
- `svix-signature`: 서명

**Body**: Clerk 웹훅 페이로드

## 보안 아키텍처

### 인증 계층

1. **Clerk 인증**
   - 사용자 인증 및 세션 관리
   - JWT 토큰 발급

2. **미들웨어 보호**
   - `/admin/*` 경로는 인증 필수
   - 인증되지 않은 사용자는 `/sign-in`으로 리다이렉트

3. **데이터베이스 권한**
   - Supabase RLS 정책으로 데이터 접근 제어
   - Service Role Key는 서버 사이드에서만 사용

### 웹훅 보안

1. **서명 검증**
   - svix 라이브러리를 사용한 서명 검증
   - `CLERK_WEBHOOK_SECRET`으로 검증

2. **미들웨어 제외**
   - 웹훅 엔드포인트는 Clerk 미들웨어에서 제외
   - 서명 검증으로만 보호

## 상태 관리

현재 프로젝트는 서버 컴포넌트와 클라이언트 컴포넌트를 혼합 사용합니다:

- **서버 컴포넌트**: 데이터 페칭, 인증 확인
- **클라이언트 컴포넌트**: 인터랙티브 UI, 폼 처리

상태 관리 라이브러리(Redux, Zustand 등)는 사용하지 않으며, React의 기본 상태 관리와 서버 컴포넌트를 활용합니다.

## 성능 최적화

1. **서버 컴포넌트**
   - 대부분의 페이지가 서버 컴포넌트로 구현
   - 클라이언트 번들 크기 최소화

2. **데이터베이스 인덱스**
   - 자주 조회되는 컬럼에 인덱스 생성
   - `created_at`, `email`, `clerk_user_id` 등

3. **이미지 최적화**
   - Next.js Image 컴포넌트 사용 (필요시)

## 확장성 고려사항

### 수평 확장
- Next.js는 서버리스 함수로 실행되므로 자동으로 확장됨
- Supabase는 관리형 데이터베이스로 자동 확장

### 데이터베이스 확장
- 현재는 단일 데이터베이스 사용
- 필요시 읽기 전용 복제본 추가 가능

### 캐싱 전략
- 현재는 캐싱 미사용
- 필요시 Redis 등 캐시 레이어 추가 가능

## 모니터링 및 로깅

1. **에러 로깅**
   - 콘솔 로깅 (개발 환경)
   - Vercel Functions 로그 (프로덕션)

2. **분석**
   - GA4: 사용자 행동 분석
   - GTM: 태그 관리

3. **웹훅 이벤트 추적**
   - `webhook_events` 테이블에 모든 이벤트 저장
   - 처리 상태 추적

## 배포 아키텍처

```
GitHub Repository
    │
    ▼
Vercel (자동 배포)
    │
    ├─ Preview Deployments (PR별)
    │
    └─ Production Deployment (main 브랜치)
            │
            ├─ Next.js App (서버리스 함수)
            │
            └─ Static Assets (CDN)
```

## 향후 개선 방향

1. **캐싱 레이어**
   - Redis 또는 Vercel KV 추가
   - 자주 조회되는 데이터 캐싱

2. **이메일 서비스**
   - Resend 또는 SendGrid 연동
   - 웹훅 알림을 이메일로 전송

3. **실시간 업데이트**
   - Supabase Realtime 구독
   - 관리자 대시보드 실시간 업데이트

4. **테스트 인프라**
   - 단위 테스트
   - 통합 테스트
   - E2E 테스트

