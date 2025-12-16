# 준비 체크리스트

프로젝트를 시작하기 전에 다음 항목들을 준비해야 합니다.

## ✅ 필수 준비 사항

### 1. Supabase 프로젝트
- [ ] Supabase 계정 생성 및 로그인
- [ ] 새 프로젝트 생성
- [ ] Project URL 복사
- [ ] Anon Key 복사
- [ ] Service Role Key 복사 (⚠️ 보안 주의)
- [ ] SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행

### 2. Clerk 애플리케이션
- [ ] Clerk 계정 생성 및 로그인
- [ ] 새 애플리케이션 생성
- [ ] Publishable Key 복사
- [ ] Secret Key 복사 (⚠️ 보안 주의)
- [ ] 인증 방법 설정 (이메일 등)
- [ ] 경로 설정:
  - Sign-in URL: `/sign-in`
  - Sign-up URL: `/sign-up`
  - After sign-in URL: `/admin`
  - After sign-up URL: `/admin`
- [ ] 웹훅 엔드포인트 등록:
  - 개발: `http://localhost:3000/api/webhooks/clerk` 또는 ngrok URL
  - 프로덕션: `https://your-domain.com/api/webhooks/clerk`
- [ ] 웹훅 이벤트 선택: `user.created`, `user.deleted`
- [ ] 웹훅 시크릿 복사 (`CLERK_WEBHOOK_SECRET`)
- [ ] 테스트 사용자 생성 (웹훅이 자동으로 admin_users에 추가)
- [ ] 첫 관리자 role을 'admin'으로 변경 (Supabase 또는 관리자 페이지에서)

### 3. Google Analytics 4
- [ ] Google Analytics 계정 생성
- [ ] GA4 속성 생성
- [ ] 웹 데이터 스트림 생성
- [ ] Measurement ID 복사 (형식: `G-XXXXXXXXXX`)

### 4. Google Tag Manager
- [ ] Google Tag Manager 계정 생성
- [ ] 새 컨테이너 생성 (타입: Web)
- [ ] Container ID 복사 (형식: `GTM-XXXXXXX`)

### 5. GitHub 저장소
- [ ] GitHub 계정 로그인
- [ ] 새 저장소 생성
- [ ] 저장소 URL 확인

### 6. Vercel 계정
- [ ] Vercel 계정 생성 및 로그인
- [ ] GitHub 계정 연결
- [ ] (배포 시) 프로젝트 import 및 환경변수 설정

## 📝 환경변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 입력하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin

# Clerk Webhook
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔐 보안 주의사항

- ⚠️ `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개 저장소에 커밋하지 마세요
- ⚠️ `CLERK_SECRET_KEY`는 절대 공개 저장소에 커밋하지 마세요
- ⚠️ `.env.local` 파일은 `.gitignore`에 포함되어 있습니다
- ✅ 프로덕션 환경에서는 Vercel 대시보드에서 환경변수를 설정하세요

## 🚀 시작하기

모든 준비가 완료되면:

1. 환경변수 파일 생성:
   ```bash
   cp .env.local.example .env.local
   # .env.local 파일을 열어 모든 값 입력
   ```

2. 의존성 설치:
   ```bash
   pnpm install
   ```

3. 개발 서버 실행:
   ```bash
   pnpm dev
   ```

4. 브라우저에서 http://localhost:3000 열기

5. 관리자 페이지 접근:
   - http://localhost:3000/admin
   - Clerk 로그인 후 접근 가능

## 📚 추가 문서

- `README.md`: 프로젝트 개요 및 기본 사용법
- `SETUP_GUIDE.md`: 상세한 설정 가이드

## ❓ 문제 해결

### Supabase 연결 오류
- 환경변수가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- SQL 마이그레이션이 실행되었는지 확인

### Clerk 인증 오류
- Clerk 대시보드에서 경로 설정 확인
- 환경변수 키가 올바른지 확인
- 브라우저 콘솔에서 오류 확인

### 관리자 페이지 접근 불가
- Supabase `admin_users` 테이블에 사용자 추가 확인
- Clerk 사용자 ID가 올바른지 확인
- 사용자 역할이 'admin'인지 확인

