# Clerk 로그인 문제 해결 가이드

## "Unable to complete action at this time" 오류 해결

이 오류는 여러 원인이 있을 수 있습니다. 아래 단계를 순서대로 확인하세요.

## 1. 환경변수 확인

`.env.local` 파일에 다음 환경변수가 올바르게 설정되어 있는지 확인하세요:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

### 확인 방법

1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 환경변수 값이 올바른지 확인 (Clerk 대시보드에서 복사)
3. 개발 서버 재시작 (`pnpm dev`)

## 2. Clerk 대시보드 설정 확인

### 2.1 허용된 도메인 확인

1. [Clerk 대시보드](https://dashboard.clerk.com)에 로그인
2. **Settings** > **Domains** 이동
3. 다음 도메인이 허용되어 있는지 확인:
   - 개발 환경: `localhost` (포트 번호 없이)
   - 프로덕션 환경: 실제 도메인 (예: `yourdomain.com`)

### 2.2 리다이렉트 URL 확인

1. **Settings** > **Paths** 이동
2. 다음 경로가 올바르게 설정되어 있는지 확인:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/admin`
   - After sign-up URL: `/admin`

### 2.3 인증 방법 확인

1. **User & Authentication** > **Email, Phone, Username** 이동
2. 사용하려는 인증 방법이 활성화되어 있는지 확인:
   - 이메일/비밀번호
   - 소셜 로그인 (Google, GitHub 등)

## 3. 브라우저 콘솔 확인

브라우저 개발자 도구(F12)를 열고 Console 탭에서 다음을 확인:

1. Clerk 관련 오류 메시지 확인
2. 네트워크 탭에서 Clerk API 요청 실패 여부 확인
3. CORS 오류가 있는지 확인

## 4. 일반적인 해결 방법

### 4.1 브라우저 캐시 및 쿠키 삭제

1. 브라우저 설정에서 캐시 및 쿠키 삭제
2. 시크릿 모드에서 테스트

### 4.2 개발 서버 재시작

```bash
# 개발 서버 중지 후 재시작
pnpm dev
```

### 4.3 환경변수 재설정

1. Clerk 대시보드에서 새로운 키 생성
2. `.env.local` 파일 업데이트
3. 개발 서버 재시작

## 5. 추가 디버깅

### 5.1 환경변수 확인 페이지

브라우저에서 `/debug-user` 페이지를 방문하여 환경변수가 올바르게 로드되는지 확인할 수 있습니다.

### 5.2 네트워크 요청 확인

브라우저 개발자 도구의 Network 탭에서:
- `clerk.accounts.dev` 도메인으로의 요청이 성공하는지 확인
- 실패한 요청의 상태 코드와 응답 확인

## 6. Clerk 서비스 상태 확인

[Clerk Status Page](https://status.clerk.com)에서 서비스 장애가 있는지 확인하세요.

## 7. 여전히 문제가 해결되지 않는 경우

1. Clerk 대시보드의 **Support** 섹션에서 문의
2. 오류 메시지와 함께 다음 정보 제공:
   - 브라우저 콘솔 오류 메시지
   - 네트워크 탭의 실패한 요청 정보
   - 사용 중인 Clerk 버전 (`@clerk/nextjs`)


