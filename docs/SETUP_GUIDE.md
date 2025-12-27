# 설정 가이드

이 문서는 프로젝트를 처음 설정할 때 필요한 단계별 가이드를 제공합니다.

## 1. Supabase 설정

### 1.1 프로젝트 생성

1. https://supabase.com 에 접속하여 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 선택
4. 프로젝트 생성 완료 대기 (약 2분)

### 1.2 API 키 확인

1. 프로젝트 대시보드에서 "Settings" > "API" 이동
2. 다음 값들을 복사:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` (⚠️ 절대 공개하지 마세요!)

### 1.3 데이터베이스 스키마 생성

1. Supabase 대시보드에서 "SQL Editor" 열기
2. 다음 마이그레이션 파일들을 순서대로 실행:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_webhook_events.sql`
   - `supabase/migrations/003_mvp_transition.sql` (MVP 전환 기능 사용 시)
   - `supabase/migrations/004_setup_storage.sql` (Storage 기능 사용 시)
3. 각 파일의 내용을 복사하여 "Run" 버튼 클릭하여 실행 확인

## 2. Clerk 설정

### 2.1 애플리케이션 생성

1. https://clerk.com 에 접속하여 로그인
2. "Create Application" 클릭
3. 애플리케이션 이름 입력
4. 인증 방법 선택 (이메일, 소셜 로그인 등)
5. 애플리케이션 생성 완료

### 2.2 API 키 확인

1. Clerk 대시보드에서 "API Keys" 이동
2. 다음 값들을 복사:
   - **Publishable key**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key**: `CLERK_SECRET_KEY` (⚠️ 절대 공개하지 마세요!)

### 2.3 인증 설정

1. "User & Authentication" > "Email, Phone, Username" 이동
2. 원하는 인증 방법 활성화
3. "Paths" 섹션에서 다음 경로 설정:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/admin`
   - After sign-up URL: `/admin`

### 2.4 Clerk + Supabase 네이티브 통합 설정

**중요**: 2025년 4월부터 Clerk의 네이티브 Supabase 통합을 사용합니다. JWT Template은 더 이상 필요하지 않습니다.

1. Clerk Dashboard → **API Keys** 메뉴
2. **"Frontend API"** URL 복사 (예: `https://your-app-12.clerk.accounts.dev`)
3. Supabase Dashboard로 이동
4. 프로젝트 선택 → **Settings** → **Authentication** → **Providers**
5. 페이지 하단으로 스크롤하여 **"Third-Party Auth"** 섹션 찾기
6. **"Enable Custom Access Token"** 또는 **"Add Provider"** 클릭
7. 다음 정보 입력:
   - **Provider Name**: `Clerk` (또는 원하는 이름)
   - **JWT Issuer (Issuer URL)**: `https://your-app-12.clerk.accounts.dev` (실제 Frontend API URL로 교체)
   - **JWKS Endpoint (JWKS URI)**: `https://your-app-12.clerk.accounts.dev/.well-known/jwks.json` (동일하게 실제 URL로 교체)
8. **"Save"** 또는 **"Add Provider"** 클릭

### 2.5 웹훅 설정

1. Clerk 대시보드에서 "Webhooks" 이동
2. "Add Endpoint" 클릭
3. Endpoint URL 입력:
   - 개발: `http://localhost:3000/api/webhooks/clerk` (또는 ngrok URL)
   - 프로덕션: `https://your-domain.com/api/webhooks/clerk`
4. 이벤트 선택:
   - ✅ `user.created`
   - ✅ `user.deleted`
5. "Create" 클릭
6. "Signing Secret" 복사하여 `.env.local`의 `CLERK_WEBHOOK_SECRET`에 설정

### 2.6 첫 번째 관리자 추가

**방법 1: 웹훅 사용 (권장)**
- Clerk에서 새 사용자를 생성하면 웹훅이 자동으로 `admin_users` 테이블에 추가합니다 (기본 role: 'viewer')
- 이후 Supabase에서 직접 role을 'admin'으로 변경하거나 관리자 페이지에서 변경

**방법 2: 수동 추가**
1. Clerk 대시보드에서 "Users" 이동
2. 테스트 사용자 생성 또는 기존 사용자 선택
3. 사용자 ID 복사 (예: `user_2abc123...`)
4. Supabase SQL Editor에서 다음 실행:

```sql
INSERT INTO admin_users (clerk_user_id, role)
VALUES ('복사한_사용자_ID', 'admin');
```

## 3. Google Analytics 4 설정

### 3.1 속성 생성

1. https://analytics.google.com 에 접속
2. "Admin" > "Create Property" 클릭
3. 속성 이름 입력 및 설정 완료
4. "Data Streams" > "Web" 선택
5. 웹사이트 URL 입력

### 3.2 Measurement ID 확인

1. 생성된 데이터 스트림 클릭
2. "Measurement ID" 복사 (예: `G-XXXXXXXXXX`)
3. `NEXT_PUBLIC_GA4_MEASUREMENT_ID`에 설정

## 4. Google Tag Manager 설정

### 4.1 컨테이너 생성

1. https://tagmanager.google.com 에 접속
2. "Create Account" 또는 기존 계정 선택
3. 컨테이너 이름 입력
4. 타겟 플랫폼으로 "Web" 선택
5. 컨테이너 생성

### 4.2 Container ID 확인

1. 생성된 컨테이너의 "Container ID" 복사 (예: `GTM-XXXXXXX`)
2. `NEXT_PUBLIC_GTM_CONTAINER_ID`에 설정

## 5. GitHub 저장소 설정

### 5.1 저장소 생성

1. https://github.com 에 접속
2. "New repository" 클릭
3. 저장소 이름 입력
4. "Create repository" 클릭

### 5.2 로컬 저장소 연결

```bash
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

## 6. Vercel 배포 설정

### 6.1 프로젝트 연결

1. https://vercel.com 에 접속하여 로그인
2. "Add New..." > "Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `pnpm build`
   - Output Directory: `.next`

### 6.2 환경변수 설정

Vercel 대시보드에서 "Settings" > "Environment Variables" 이동하여 다음 변수들을 추가:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- `NEXT_PUBLIC_GTM_CONTAINER_ID`
- `NEXT_PUBLIC_STORAGE_BUCKET` (Storage 기능 사용 시)
- `NEXT_PUBLIC_APP_URL` (프로덕션 URL)

### 6.3 배포

1. "Deploy" 버튼 클릭
2. 배포 완료 대기
3. 배포된 URL에서 테스트

## 7. 로컬 개발 환경 설정

### 7.1 환경변수 파일 생성

프로젝트 루트에 `.env.local` 파일 생성:

```bash
cp .env.local.example .env.local
```

### 7.2 환경변수 입력

`.env.local` 파일을 열어 위에서 복사한 모든 값들을 입력하세요.

### 7.3 개발 서버 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 http://localhost:3000 을 열어 확인하세요.

## 문제 해결

### Supabase 연결 오류

- 환경변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- RLS 정책이 올바르게 설정되었는지 확인

### Clerk 인증 오류

- Clerk 대시보드에서 경로 설정 확인
- 환경변수 키가 올바른지 확인
- 브라우저 콘솔에서 오류 메시지 확인

### 관리자 페이지 접근 불가

- Supabase의 `admin_users` 테이블에 사용자가 추가되었는지 확인
- Clerk 사용자 ID가 올바른지 확인
- 사용자 역할이 'admin'인지 확인

## 다음 단계

설정이 완료되면:

1. 홈페이지에서 이메일 제출 테스트
2. 관리자 대시보드에서 데이터 확인
3. 분석 도구에서 이벤트 트래킹 확인

