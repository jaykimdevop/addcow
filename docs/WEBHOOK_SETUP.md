# Clerk 웹훅 설정 가이드

이 문서는 Clerk 웹훅을 개발 및 프로덕션 환경에서 설정하는 방법을 설명합니다.

## 개요

Clerk 웹훅은 사용자 이벤트(생성, 삭제 등)를 실시간으로 받아 처리합니다. 이 프로젝트에서는 다음 이벤트를 처리합니다:

- `user.created`: 새 사용자 생성 시 `admin_users` 테이블에 자동 추가 (기본 role: 'viewer')
- `user.deleted`: 사용자 삭제 시 `admin_users` 테이블에서 자동 제거

## 웹훅 엔드포인트

웹훅 엔드포인트: `/api/webhooks/clerk`

## 개발 환경 설정

### 방법 1: Clerk 개발 모드 사용 (권장)

Clerk는 개발 환경에서 로컬 웹훅 테스트를 위한 개발 모드를 제공합니다.

1. **Clerk 대시보드 설정**
   - Clerk 대시보드 > Webhooks 이동
   - "Add Endpoint" 클릭
   - Endpoint URL: `https://your-app.clerk.accounts.dev` (Clerk 개발 모드 URL)
   - 또는 로컬 개발을 위해 ngrok 같은 터널링 도구 사용

2. **로컬 터널링 (선택사항)**
   ```bash
   # ngrok 설치 후
   ngrok http 3000
   # 생성된 URL을 Clerk 웹훅 엔드포인트로 등록
   ```

3. **웹훅 시크릿 복사**
   - Clerk 대시보드에서 웹훅 생성 후
   - "Signing Secret" 복사
   - `.env.local` 파일에 `CLERK_WEBHOOK_SECRET`로 설정

### 방법 2: Vercel 프리뷰 배포 사용

1. **프로젝트를 Vercel에 배포**
   ```bash
   vercel
   ```

2. **프리뷰 URL 확인**
   - Vercel 대시보드에서 프리뷰 배포 URL 확인
   - 예: `https://your-app-git-main.vercel.app`

3. **Clerk 웹훅 등록**
   - Clerk 대시보드 > Webhooks
   - Endpoint URL: `https://your-app-git-main.vercel.app/api/webhooks/clerk`
   - 이벤트 선택: `user.created`, `user.deleted`
   - Signing Secret 복사하여 `.env.local`에 설정

## 프로덕션 환경 설정

1. **Vercel 프로덕션 배포**
   - GitHub에 코드 푸시
   - Vercel이 자동으로 프로덕션 배포

2. **Clerk 웹훅 등록**
   - Clerk 대시보드 > Webhooks
   - "Add Endpoint" 클릭
   - Endpoint URL: `https://your-domain.com/api/webhooks/clerk`
   - 이벤트 선택:
     - ✅ `user.created`
     - ✅ `user.deleted`
   - "Create" 클릭

3. **웹훅 시크릿 설정**
   - 생성된 웹훅의 "Signing Secret" 복사
   - Vercel 대시보드 > Project Settings > Environment Variables
   - `CLERK_WEBHOOK_SECRET` 추가
   - Value: 복사한 시크릿
   - Environment: Production (및 Preview, Development)

4. **웹훅 테스트**
   - Clerk 대시보드에서 "Send test event" 클릭
   - 웹훅이 정상적으로 수신되는지 확인

## 환경변수 설정

### 로컬 개발 (`.env.local`)

```env
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Vercel 환경변수

Vercel 대시보드에서 다음 환경변수를 설정하세요:

- `CLERK_WEBHOOK_SECRET`: Clerk 웹훅 시크릿

## 데이터베이스 마이그레이션

웹훅 이벤트를 로깅하기 위해 다음 마이그레이션을 실행하세요:

```sql
-- Supabase SQL Editor에서 실행
-- supabase/migrations/002_webhook_events.sql 파일 내용 실행
```

또는 Supabase CLI 사용:

```bash
supabase db push
```

## 웹훅 동작 방식

### user.created 이벤트

1. Clerk에서 새 사용자 생성
2. 웹훅이 `/api/webhooks/clerk`로 POST 요청 전송
3. 서버에서:
   - 웹훅 서명 검증
   - 이벤트를 `webhook_events` 테이블에 로깅
   - `admin_users` 테이블에 새 사용자 추가 (role: 'viewer')
   - 알림 전송 (구현된 경우)
   - 이벤트를 'processed'로 표시

### user.deleted 이벤트

1. Clerk에서 사용자 삭제
2. 웹훅이 `/api/webhooks/clerk`로 POST 요청 전송
3. 서버에서:
   - 웹훅 서명 검증
   - 이벤트를 `webhook_events` 테이블에 로깅
   - `admin_users` 테이블에서 사용자 제거
   - 알림 전송 (구현된 경우)
   - 이벤트를 'processed'로 표시

## 웹훅 이벤트 로깅

모든 웹훅 이벤트는 `webhook_events` 테이블에 저장됩니다:

- `event_type`: 이벤트 타입 (예: 'user.created')
- `event_data`: 이벤트 데이터 (JSON)
- `processed`: 처리 완료 여부
- `created_at`: 생성 시간

관리자 대시보드에서 웹훅 이벤트를 조회할 수 있습니다 (향후 구현).

## 문제 해결

### 웹훅이 수신되지 않음

1. **Clerk 대시보드 확인**
   - Webhooks > Endpoints에서 엔드포인트 상태 확인
   - 최근 이벤트 로그 확인

2. **환경변수 확인**
   - `CLERK_WEBHOOK_SECRET`이 올바르게 설정되었는지 확인
   - Vercel의 경우 환경변수가 올바른 환경에 설정되었는지 확인

3. **서버 로그 확인**
   - Vercel 대시보드 > Functions에서 로그 확인
   - 로컬 개발의 경우 터미널 로그 확인

### 웹훅 서명 검증 실패

- `CLERK_WEBHOOK_SECRET`이 Clerk 대시보드의 Signing Secret과 일치하는지 확인
- 웹훅이 생성된 후 시크릿이 변경되지 않았는지 확인

### admin_users 테이블에 사용자가 추가되지 않음

1. **데이터베이스 권한 확인**
   - Service Role Key가 올바르게 설정되었는지 확인
   - RLS 정책이 Service Role에 적절한 권한을 부여하는지 확인

2. **중복 키 오류**
   - 사용자가 이미 존재하는 경우 정상 동작입니다
   - 웹훅이 중복으로 전송된 경우를 처리합니다

## 보안 고려사항

- ⚠️ `CLERK_WEBHOOK_SECRET`는 절대 공개 저장소에 커밋하지 마세요
- ✅ 웹훅 엔드포인트는 서명 검증을 통해 보호됩니다
- ✅ 미들웨어에서 웹훅 엔드포인트를 제외하여 인증 없이 접근 가능합니다 (서명 검증으로 보호)

## 추가 리소스

- [Clerk Webhooks 문서](https://clerk.com/docs/integrations/webhooks/overview)
- [Svix 라이브러리 문서](https://docs.svix.com/)

