# ADDCOW

ADDCOW RAG 서비스를 위한 랜딩 페이지와 관리자 대시보드입니다. Faked Door 테스트를 위한 이메일 수집 시스템과 관리자 대시보드를 제공합니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [주요 기능](#주요-기능)
- [프로젝트 구조](#프로젝트-구조)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [시작하기](#시작하기)
- [API 엔드포인트](#api-엔드포인트)
- [인증 및 권한](#인증-및-권한)
- [배포](#배포)
- [보안 고려사항](#보안-고려사항)
- [트러블슈팅](#트러블슈팅)
- [추가 문서](#추가-문서)

## 🎯 프로젝트 개요

이 프로젝트는 **Faked Door 테스트**를 위한 웹 애플리케이션으로, 다음과 같은 기능을 제공합니다:

- **랜딩 페이지**: 이메일 수집을 통한 대기자 명단 관리
- **관리자 대시보드**: 제출 데이터 통계, 조회, 관리
- **사용자 관리**: 관리자 권한 관리 시스템
- **MVP 모드**: 사이트를 대기자 수집 모드에서 MVP 모드로 전환 가능
- **Google Drive 연동**: 사용자 파일 업로드 및 관리
- **이메일 알림**: 대기자에게 계정 생성 알림 발송

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 16.0.10 (App Router)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: react-icons (일반 아이콘은 react-icons/lu 사용)
- **Charts**: recharts 3.6.0
- **Animation**: motion (framer-motion 대체)
- **UI Components**: shadcn/ui

### Backend
- **Runtime**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk 6.36.3
- **Webhook Verification**: svix 1.82.0
- **Rate Limiting**: Upstash Redis 1.35.8
- **Email**: Nodemailer 6.9.16

### Infrastructure & Services
- **Hosting**: Vercel
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Analytics**: Google Analytics 4, Google Tag Manager
- **Error Tracking**: Sentry 10.32.1
- **File Processing**: xlsx 0.18.5

### Development Tools
- **Package Manager**: pnpm 9.0.0
- **Linter/Formatter**: Biome 2.3.9 (ESLint/Prettier 대신)
- **Type Checking**: TypeScript strict mode

## ✨ 주요 기능

### 1. 랜딩 페이지 (`/`)
- **비로그인 사용자**: Orb 디자인의 마케팅 페이지 표시
- **이메일 수집**: 이메일 주소 제출 및 중복 검사
- **GA4/GTM 이벤트 트래킹**: 제출 이벤트 자동 추적
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- **다크/화이트 모드**: 자동 테마 전환

### 2. 사용자 홈페이지 (`/home`)
- **로그인된 사용자**: Dock UI가 포함된 홈 화면
- **프로필 메뉴**: 사용자 정보 및 설정
- **Google Drive 연동**: 파일 업로드 및 관리
- **설정 페이지**: 통신 설정, Dock 설정 등

### 3. 관리자 대시보드 (`/admin`)

#### 대시보드 (`/admin`)
- **통계 카드**: 전체/오늘/이번 주/이번 달 제출 수
- **차트**: 최근 30일 제출 추이 (recharts)
- **최근 제출**: 최근 10개 제출 내역

#### 제출 데이터 조회 (`/admin/submissions`)
- **테이블 뷰**: 페이지네이션, 정렬, 검색
- **필터링**: 날짜 범위 필터
- **CSV 내보내기**: 선택한 기간 데이터 다운로드

#### 사용자 관리 (`/admin/users`)
- **관리자 목록**: 모든 관리자 사용자 조회
- **사용자 추가**: Clerk User ID로 새 관리자 추가
- **권한 관리**: admin/viewer 역할 할당
- **사용자 삭제**: 관리자 제거 (자기 자신 제외)

#### 설정 (`/admin/settings`)
- **사이트 모드**: 대기자 수집 모드 ↔ MVP 모드 전환
- **Dock 설정**: Dock 표시/숨김 설정
- **알림 설정**: 대기자 알림 발송 설정

#### 데이터 내보내기 (`/admin/export`)
- **CSV 다운로드**: 전체 또는 기간별 데이터 내보내기
- **날짜 범위 선택**: 시작일/종료일 지정

### 4. MVP 모드 (`/addcow`)
- **제품 소개**: Hero 섹션, 기능 소개, 가격 정보
- **사용자 등록**: 회원가입 폼
- **연락처 폼**: 문의하기 기능
- **사이트 모드가 'mvp'일 때만 접근 가능**

### 5. API 기능
- **이메일 제출**: Rate limiting 적용
- **Clerk 웹훅**: 사용자 생성/삭제 자동 동기화
- **Google Drive 연동**: OAuth 인증 및 파일 목록 조회
- **이메일 알림**: 대기자에게 계정 생성 알림 발송
- **Vercel API 연동**: 배포 상태 확인

## 📁 프로젝트 구조

```
addcow/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (root)/               # 루트 레이아웃
│   │   │   ├── layout.tsx        # 전역 레이아웃 (ClerkProvider, GA4/GTM)
│   │   │   ├── page.tsx         # 홈페이지 (비로그인: 마케팅, 로그인: /home 리다이렉트)
│   │   │   ├── globals.css      # 전역 스타일
│   │   │   └── template.tsx     # 템플릿 (애니메이션)
│   │   ├── home/                # 사용자 홈페이지
│   │   │   └── page.tsx         # 로그인된 사용자 홈 화면
│   │   ├── addcow/               # MVP 모드 페이지
│   │   │   └── page.tsx         # 제품 소개 및 등록 페이지
│   │   ├── admin/                # 관리자 페이지 (인증 필요)
│   │   │   ├── layout.tsx       # 관리자 레이아웃 (권한 확인)
│   │   │   ├── page.tsx         # 대시보드
│   │   │   ├── submissions/     # 제출 데이터 조회
│   │   │   ├── users/           # 사용자 관리
│   │   │   ├── settings/        # 설정
│   │   │   └── export/          # 데이터 내보내기
│   │   ├── api/                  # API 라우트
│   │   │   ├── submissions/     # 이메일 제출 API
│   │   │   ├── admin/           # 관리자 API
│   │   │   │   ├── users/       # 사용자 관리 API
│   │   │   │   ├── export/      # 데이터 내보내기 API
│   │   │   │   ├── settings/    # 설정 API
│   │   │   │   ├── notify-waitlist/  # 대기자 알림 API
│   │   │   │   └── create-accounts/  # 계정 생성 API
│   │   │   ├── webhooks/        # 웹훅 엔드포인트
│   │   │   │   └── clerk/       # Clerk 웹훅
│   │   │   ├── auth/            # 인증 관련 API
│   │   │   │   └── google/      # Google OAuth
│   │   │   ├── drive/           # Google Drive API
│   │   │   ├── upload/          # 파일 업로드 API
│   │   │   ├── contact/         # 연락처 API
│   │   │   └── waitlist/        # 대기자 명단 API
│   │   ├── sign-in/             # Clerk 로그인 페이지
│   │   ├── sign-up/             # Clerk 회원가입 페이지
│   │   ├── settings/            # 사용자 설정 페이지
│   │   ├── upload/               # 파일 업로드 페이지
│   │   └── user-profile/        # 사용자 프로필 페이지
│   ├── components/               # React 컴포넌트
│   │   ├── ui/                   # shadcn/ui 컴포넌트
│   │   ├── admin/                # 관리자 전용 컴포넌트
│   │   │   ├── AdminLayout.tsx  # 관리자 레이아웃
│   │   │   ├── AdminHeader.tsx  # 관리자 헤더
│   │   │   ├── StatsCards.tsx  # 통계 카드
│   │   │   ├── SubmissionsChart.tsx  # 제출 차트
│   │   │   ├── SubmissionsTable.tsx # 제출 테이블
│   │   │   ├── UsersTable.tsx   # 사용자 테이블
│   │   │   └── ExportButton.tsx # 내보내기 버튼
│   │   ├── mvp/                  # MVP 모드 컴포넌트
│   │   │   ├── ContactForm.tsx  # 연락처 폼
│   │   │   ├── FeatureDemo.tsx  # 기능 소개
│   │   │   ├── Pricing.tsx       # 가격 정보
│   │   │   ├── ProductInfo.tsx  # 제품 정보
│   │   │   └── UserRegistration.tsx  # 사용자 등록
│   │   ├── EmailCollector.tsx   # 이메일 수집 컴포넌트
│   │   ├── HeroSection.tsx      # 히어로 섹션
│   │   ├── HomeClient.tsx        # 홈 클라이언트 컴포넌트
│   │   ├── Dock.tsx              # Dock UI 컴포넌트
│   │   ├── GlobalDock.tsx       # 전역 Dock
│   │   ├── ProfileMenu.tsx      # 프로필 메뉴
│   │   └── ToastProvider.tsx    # Toast 알림 제공자
│   ├── lib/                      # 유틸리티 및 설정
│   │   ├── supabase/             # Supabase 클라이언트
│   │   │   ├── client.ts        # 브라우저 클라이언트
│   │   │   ├── server.ts        # 서버 클라이언트
│   │   │   └── clerk-client.ts  # Clerk 통합 클라이언트
│   │   ├── clerk.ts              # Clerk 헬퍼 함수
│   │   ├── analytics.ts          # GA4/GTM 헬퍼
│   │   ├── email.ts              # 이메일 발송 유틸리티
│   │   ├── google-drive.ts      # Google Drive API
│   │   ├── ratelimit.ts          # Rate limiting
│   │   ├── site-settings.ts      # 사이트 설정 관리
│   │   ├── vercel.ts             # Vercel API
│   │   └── utils.ts              # 공통 유틸리티
│   ├── hooks/                    # React Hooks
│   │   └── useGoogleDriveStatus.ts  # Google Drive 상태 훅
│   ├── types/                    # TypeScript 타입 정의
│   │   ├── database.ts          # 데이터베이스 타입
│   │   ├── api.ts                # API 타입
│   │   └── google-drive.ts      # Google Drive 타입
│   └── middleware.ts            # Next.js 미들웨어 (인증 보호)
├── supabase/
│   ├── migrations/               # 데이터베이스 마이그레이션
│   │   ├── 20251216000001_initial_schema.sql
│   │   ├── 20251216000002_webhook_events.sql
│   │   ├── 20251216000003_mvp_transition.sql
│   │   ├── 20251216000004_setup_storage.sql
│   │   ├── 20251216000005_add_user_info_to_admin_users.sql
│   │   ├── 20251216000006_drop_admin_users_preview_view.sql
│   │   └── 20251216000007_google_drive_integration.sql
│   └── config.toml               # Supabase 설정
├── docs/                         # 문서
│   ├── SETUP_GUIDE.md            # 설정 가이드
│   ├── ARCHITECTURE.md           # 아키텍처 문서
│   ├── API_REFERENCE.md          # API 레퍼런스
│   └── ...                       # 기타 문서
├── public/                       # 정적 파일
├── package.json                  # 의존성 및 스크립트
├── tsconfig.json                 # TypeScript 설정
├── biome.json                    # Biome 설정
├── next.config.ts                # Next.js 설정
└── README.md                     # 이 파일
```

## 🗄 데이터베이스 스키마

### submissions 테이블
사용자가 제출한 이메일 주소를 저장합니다.

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  metadata JSONB,
  notified BOOLEAN DEFAULT false,
  account_created BOOLEAN DEFAULT false,
  notified_at TIMESTAMP WITH TIME ZONE
);
```

**RLS 정책**:
- `INSERT`: 모든 사용자 허용 (이메일 수집용)
- `SELECT`: 관리자만 허용

**인덱스**:
- `idx_submissions_created_at`: 날짜별 조회 최적화
- `idx_submissions_email`: 이메일 중복 검사 최적화

### admin_users 테이블
관리자 권한을 관리합니다. Clerk user_id와 연결됩니다.

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  username TEXT,
  image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**RLS 정책**:
- 모든 작업: 관리자만 허용

**역할**:
- `admin`: 모든 권한 (사용자 관리, 데이터 내보내기, 설정 변경 등)
- `viewer`: 조회만 가능 (읽기 전용)

**인덱스**:
- `idx_admin_users_clerk_user_id`: 인증 시 조회 최적화

### webhook_events 테이블
웹훅 이벤트를 로깅합니다.

```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### site_settings 테이블
사이트 설정을 저장합니다.

```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_by TEXT
);
```

**주요 설정 키**:
- `site_mode`: `'waitlist'` 또는 `'mvp'`
- `dock_enabled`: Dock 표시 여부

### google_drive_tokens 테이블
Google Drive OAuth 토큰을 저장합니다.

```sql
CREATE TABLE google_drive_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

## 🚀 시작하기

### 필수 요구사항

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0
- **Supabase 계정**: 프로젝트 생성 필요
- **Clerk 계정**: 애플리케이션 생성 필요
- **Google Cloud Console**: Google Drive API 활성화 (선택사항)

### 1. 저장소 클론

```bash
git clone https://github.com/jaykimdevop/addcow.git
cd addcow
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경변수 설정

`.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin

# Clerk Webhook
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Analytics 4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Tag Manager
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX

# Supabase Storage
NEXT_PUBLIC_STORAGE_BUCKET=uploads

# Google Drive API (선택사항)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Email (선택사항, 대기자 알림용)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Vercel API (선택사항)
VERCEL_ACCESS_TOKEN=your_vercel_access_token

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Upstash Redis (Rate Limiting용, 선택사항)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### 4. 데이터베이스 설정

Supabase 프로젝트의 SQL 에디터에서 다음 마이그레이션 파일들을 **순서대로** 실행하세요:

1. `supabase/migrations/20251216000001_initial_schema.sql` - 기본 스키마
2. `supabase/migrations/20251216000002_webhook_events.sql` - 웹훅 이벤트 테이블
3. `supabase/migrations/20251216000003_mvp_transition.sql` - MVP 모드 지원
4. `supabase/migrations/20251216000004_setup_storage.sql` - Storage 설정
5. `supabase/migrations/20251216000005_add_user_info_to_admin_users.sql` - 사용자 정보 추가
6. `supabase/migrations/20251216000006_drop_admin_users_preview_view.sql` - 뷰 제거
7. `supabase/migrations/20251216000007_google_drive_integration.sql` - Google Drive 연동

### 5. 초기 관리자 설정

첫 번째 관리자 사용자를 추가하려면 Supabase SQL 에디터에서 다음을 실행하세요:

```sql
INSERT INTO admin_users (clerk_user_id, role)
VALUES ('your_clerk_user_id', 'admin');
```

`your_clerk_user_id`는 Clerk 대시보드의 사용자 목록에서 확인할 수 있습니다.

### 6. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📡 API 엔드포인트

### Public API

#### POST /api/submissions
이메일 주소를 제출합니다.

**인증**: 불필요

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (201):
```json
{
  "message": "Email submitted successfully"
}
```

**에러**:
- `400`: 이메일 형식 오류 또는 Rate limit 초과
- `409`: 이미 등록된 이메일
- `500`: 서버 오류

#### GET /api/waitlist/count
대기자 수를 조회합니다.

**인증**: 불필요

**Response** (200):
```json
{
  "count": 123
}
```

### Admin API

모든 관리자 API는 Clerk 인증이 필요하며, 일부는 `admin` 역할이 필요합니다.

#### GET /api/admin/users
관리자 사용자 목록을 조회합니다.

**인증**: 필요 (관리자 권한)

**Response** (200):
```json
[
  {
    "id": "uuid",
    "clerk_user_id": "user_xxx",
    "role": "admin",
    "email": "admin@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2025-12-16T00:00:00Z"
  }
]
```

#### POST /api/admin/users
새 관리자 사용자를 추가합니다.

**인증**: 필요 (admin 권한)

**Request**:
```json
{
  "clerk_user_id": "user_xxx",
  "role": "admin"
}
```

#### DELETE /api/admin/users/[id]
관리자 사용자를 삭제합니다.

**인증**: 필요 (admin 권한)

**에러**: 자신을 삭제하려고 시도하면 `400` 에러

#### GET /api/admin/export
제출 데이터를 CSV 형식으로 내보냅니다.

**인증**: 필요 (admin 권한)

**Query Parameters**:
- `start` (optional): 시작 날짜 (YYYY-MM-DD)
- `end` (optional): 종료 날짜 (YYYY-MM-DD)

**Response**: CSV 파일 다운로드

#### GET /api/admin/settings
사이트 설정을 조회합니다.

**인증**: 필요 (관리자 권한)

#### PUT /api/admin/settings
사이트 설정을 업데이트합니다.

**인증**: 필요 (admin 권한)

**Request**:
```json
{
  "key": "site_mode",
  "value": "mvp"
}
```

#### POST /api/admin/notify-waitlist
대기자에게 알림 이메일을 발송합니다.

**인증**: 필요 (admin 권한)

**Request**:
```json
{
  "subject": "계정이 생성되었습니다",
  "message": "안내 메시지"
}
```

### Webhook API

#### POST /api/webhooks/clerk
Clerk 웹훅을 처리합니다.

**인증**: 웹훅 서명 검증

**지원 이벤트**:
- `user.created`: 새 사용자 생성 시 `admin_users`에 자동 추가 (기본 role: 'viewer')
- `user.deleted`: 사용자 삭제 시 `admin_users`에서 자동 제거

### Google Drive API

#### GET /api/auth/google
Google OAuth 인증을 시작합니다.

#### GET /api/auth/google/callback
Google OAuth 콜백을 처리합니다.

#### GET /api/drive/status
Google Drive 연동 상태를 확인합니다.

**인증**: 필요 (로그인 사용자)

#### GET /api/drive/files
Google Drive 파일 목록을 조회합니다.

**인증**: 필요 (로그인 사용자)

### 기타 API

#### POST /api/contact
연락처 폼을 제출합니다. (MVP 모드)

#### POST /api/upload
파일을 업로드합니다.

**인증**: 필요 (로그인 사용자)

## 🔐 인증 및 권한

### Clerk 인증

이 프로젝트는 **Clerk**를 사용하여 사용자 인증을 처리합니다.

#### 인증 흐름

1. 사용자가 `/admin` 또는 보호된 페이지 접근
2. `middleware.ts`에서 인증 상태 확인
3. 인증되지 않음 → `/sign-in`으로 리다이렉트
4. 인증됨 → `admin_users` 테이블에서 권한 확인
5. 관리자가 아님 → 접근 거부 또는 홈으로 리다이렉트
6. 관리자 → 페이지 렌더링

#### 권한 레벨

- **비로그인 사용자**: 랜딩 페이지만 접근 가능
- **로그인 사용자**: `/home`, `/settings`, `/upload` 등 접근 가능
- **viewer**: 관리자 페이지 조회만 가능
- **admin**: 모든 관리자 기능 사용 가능

### 웹훅 자동 동기화

Clerk 웹훅을 통해 사용자 생성/삭제가 자동으로 `admin_users` 테이블에 반영됩니다:

- **user.created**: 새 사용자가 생성되면 `admin_users`에 자동 추가 (기본 role: 'viewer')
- **user.deleted**: 사용자가 삭제되면 `admin_users`에서 자동 제거

웹훅 설정은 [WEBHOOK_SETUP.md](./docs/WEBHOOK_SETUP.md)를 참조하세요.

## 🚢 배포

### Vercel 배포

1. **GitHub 저장소에 코드 푸시**
   ```bash
   git push origin main
   ```

2. **Vercel 대시보드에서 프로젝트 import**
   - https://vercel.com 에서 새 프로젝트 생성
   - GitHub 저장소 연결
   - 프레임워크: Next.js 자동 감지

3. **환경변수 설정**
   - Vercel 대시보드 → Settings → Environment Variables
   - `.env.local`의 모든 환경변수 추가
   - Production, Preview, Development 환경별로 설정 가능

4. **배포 완료**
   - 자동으로 배포 시작
   - 배포 완료 후 프로덕션 URL 확인

### 환경변수 확인

배포 후 다음 환경변수가 설정되었는지 확인하세요:

- ✅ Supabase URL 및 키
- ✅ Clerk 키 및 웹훅 시크릿
- ✅ GA4/GTM ID
- ✅ `NEXT_PUBLIC_APP_URL` (프로덕션 URL로 변경)

### Clerk 웹훅 URL 설정

배포 후 Clerk 대시보드에서 웹훅 URL을 설정하세요:

```
https://your-domain.com/api/webhooks/clerk
```

## 🔒 보안 고려사항

### 보안 패치
- **Next.js 16.0.10**: CVE-2025-55184, CVE-2025-55183 패치 포함
- **React 19.2.3**: 최신 보안 패치 적용

### 데이터 보호
- **Supabase RLS**: Row Level Security로 데이터 접근 제어
- **Clerk 인증**: 관리자 페이지 접근 보호
- **웹훅 서명 검증**: svix를 사용한 웹훅 서명 검증
- **Rate Limiting**: Upstash Redis를 사용한 API Rate Limiting

### 환경변수 보안
- 환경변수는 절대 커밋하지 않음
- `.env.local`은 `.gitignore`에 포함됨
- 프로덕션 환경변수는 Vercel 대시보드에서 관리

### 권한 관리
- 관리자 권한은 `admin_users` 테이블에서 관리
- RLS 정책으로 데이터베이스 레벨에서 보호
- API 레벨에서도 권한 검증 수행

## 🐛 트러블슈팅

### 일반적인 문제

#### 1. 관리자 페이지 접근 불가
**증상**: `/admin` 접근 시 홈으로 리다이렉트됨

**해결**:
- Clerk에서 로그인 확인
- Supabase에서 `admin_users` 테이블에 사용자 추가 확인
- `clerk_user_id`가 정확한지 확인

#### 2. 웹훅이 작동하지 않음
**증상**: 새 사용자가 생성되어도 `admin_users`에 추가되지 않음

**해결**:
- Clerk 대시보드에서 웹훅 URL 확인
- `CLERK_WEBHOOK_SECRET` 환경변수 확인
- `webhook_events` 테이블에서 이벤트 로그 확인

#### 3. 이메일 제출이 실패함
**증상**: 이메일 제출 시 에러 발생

**해결**:
- Supabase 연결 확인
- Rate limit 초과 여부 확인
- 브라우저 콘솔에서 에러 메시지 확인

#### 4. 모바일에서 스크롤이 안 됨
**증상**: 관리자 대시보드에서 모바일 스크롤 불가

**해결**: 이미 수정됨. `AdminLayout` 컴포넌트에서 스크롤 허용 처리됨.

### 로그 확인

- **개발 환경**: 브라우저 콘솔 및 터미널 로그
- **프로덕션**: Vercel 대시보드 → Functions → Logs
- **웹훅 이벤트**: Supabase `webhook_events` 테이블 조회

### 추가 도움말

- [CLERK_TROUBLESHOOTING.md](./docs/CLERK_TROUBLESHOOTING.md): Clerk 관련 문제 해결
- [SECURITY_GUIDE.md](./docs/SECURITY_GUIDE.md): 보안 가이드
- [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md): 상세 설정 가이드

## 📚 추가 문서

모든 상세 문서는 `docs/` 폴더에 있습니다:

- **[SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)**: 상세한 설정 가이드
- **[PREPARATION_CHECKLIST.md](./docs/PREPARATION_CHECKLIST.md)**: 준비 체크리스트
- **[WEBHOOK_SETUP.md](./docs/WEBHOOK_SETUP.md)**: Clerk 웹훅 설정 가이드
- **[SECURITY_GUIDE.md](./docs/SECURITY_GUIDE.md)**: 보안 가이드
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)**: 아키텍처 및 시스템 설계
- **[API_REFERENCE.md](./docs/API_REFERENCE.md)**: API 엔드포인트 상세 레퍼런스
- **[CLERK_TROUBLESHOOTING.md](./docs/CLERK_TROUBLESHOOTING.md)**: Clerk 문제 해결
- **[IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md)**: 전체 구현 내역 요약

## 🛠 스크립트

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 코드 검사 (Biome)
pnpm lint

# 코드 자동 수정 (Biome)
pnpm lint:fix

# 코드 포맷팅
pnpm format

# Vercel API 테스트
pnpm test:vercel
```

## 📝 코딩 컨벤션

- **TypeScript**: strict 모드 사용
- **Biome**: ESLint/Prettier 대신 Biome 사용
- **컴포넌트**: 함수형 컴포넌트 사용
- **스타일링**: Tailwind CSS 사용
- **아이콘**: 일반적인 아이콘은 `react-icons/lu` 사용
- **다크모드**: 모든 디자인은 다크/화이트 모드 대응

## 📄 라이선스

MIT
