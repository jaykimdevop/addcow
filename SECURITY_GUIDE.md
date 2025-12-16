# 보안 가이드

이 문서는 프로젝트의 보안 모범 사례와 필수 조치 사항을 설명합니다.

## 🔴 긴급 조치 필요 (즉시 실행)

### 1. API 키 재발급

**현재 상태**: `.env.local` 파일에 실제 API 키들이 저장되어 있습니다.

**조치 필요**:

#### Supabase API 키 재발급
1. [Supabase 대시보드](https://app.supabase.com) 접속
2. 프로젝트 선택 → Settings → API
3. "Reset API keys" 클릭
4. 새로운 키를 `.env.local`에 업데이트

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=새로운_anon_키
SUPABASE_SERVICE_ROLE_KEY=새로운_service_role_키
```

#### Clerk API 키 재발급
1. [Clerk 대시보드](https://dashboard.clerk.com) 접속
2. 애플리케이션 선택 → API Keys
3. "Regenerate" 클릭
4. 새로운 키를 `.env.local`에 업데이트

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=새로운_publishable_키
CLERK_SECRET_KEY=새로운_secret_키
```

#### Clerk Webhook Secret 재발급
1. Clerk 대시보드 → Webhooks
2. 기존 웹훅 삭제 후 재생성
3. 새로운 Secret을 `.env.local`에 업데이트

```bash
CLERK_WEBHOOK_SECRET=새로운_webhook_secret
```

#### Vercel Access Token 재발급
1. [Vercel 설정](https://vercel.com/account/tokens) 접속
2. 기존 토큰 삭제
3. 새 토큰 생성
4. 새로운 토큰을 `.env.local`에 업데이트

```bash
VERCEL_ACCESS_TOKEN=새로운_토큰
```

### 2. Git 히스토리 정리 (선택사항)

만약 이전에 `.env.local` 파일을 커밋한 적이 있다면, Git 히스토리에서 제거해야 합니다.

⚠️ **주의**: 이 작업은 Git 히스토리를 다시 작성하므로, 팀 프로젝트인 경우 팀원들과 협의 후 진행하세요.

```bash
# BFG Repo-Cleaner 사용 (권장)
# 1. BFG 다운로드: https://rtyley.github.io/bfg-repo-cleaner/

# 2. 실행
java -jar bfg.jar --delete-files .env.local

# 3. 히스토리 정리
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# 4. 강제 푸시 (주의!)
git push origin main --force
```

---

## ✅ 적용된 보안 개선 사항

### 1. XSS 방지

**위치**: `src/app/api/contact/route.ts`

**변경 내용**:
- `escapeHtml()` 함수 추가
- 사용자 입력 (이름, 이메일, 메시지) sanitization 적용
- HTML 특수 문자 이스케이프 처리

```typescript
// Before (위험)
html: `<p>${message.replace(/\n/g, "<br>")}</p>`

// After (안전)
const sanitizedMessage = escapeHtml(message).replace(/\n/g, "<br>");
html: `<p>${sanitizedMessage}</p>`
```

### 2. 환경변수 보호

**변경 내용**:
- `.env.local.example` 템플릿 파일 생성
- `.gitignore`에 `.env*.local` 포함 확인
- 실제 API 키는 Git에 커밋되지 않도록 설정

### 3. Lock 파일 통일

**변경 내용**:
- `package-lock.json` 삭제
- `pnpm-lock.yaml`만 사용
- `.gitignore`에 `package-lock.json` 추가

---

## 🔒 보안 모범 사례

### 1. 환경변수 관리

#### 로컬 개발
- `.env.local` 파일 사용
- Git에 절대 커밋하지 않기
- 팀원들과는 `.env.local.example` 공유

#### 프로덕션 배포
- Vercel 대시보드에서 환경변수 설정
- 프로젝트 → Settings → Environment Variables
- Production, Preview, Development 별로 설정 가능

```bash
# Vercel CLI로 설정 (선택사항)
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 2. API 키 권한 최소화

#### Supabase Service Role Key
- **위험도**: 매우 높음 (모든 RLS 정책 우회)
- **사용처**: 서버 사이드에서만 사용
- **주의**: 클라이언트에 절대 노출 금지

```typescript
// ✅ 올바른 사용
// src/app/api/admin/route.ts (서버 컴포넌트)
import { createServiceClient } from '@/lib/supabase/server';

// ❌ 잘못된 사용
// src/components/MyComponent.tsx (클라이언트 컴포넌트)
// NEVER import createServiceClient in client components!
```

#### Clerk Secret Key
- **위험도**: 매우 높음
- **사용처**: 서버 API 라우트, Webhook 검증
- **주의**: 클라이언트에 노출 금지

### 3. Webhook 보안

#### Clerk Webhook 검증
- Svix 라이브러리로 서명 검증
- `CLERK_WEBHOOK_SECRET` 환경변수 사용
- 타임스탬프 검증으로 재생 공격 방지

```typescript
// src/app/api/webhooks/clerk/route.ts
const wh = new Webhook(webhookSecret);
const evt = wh.verify(body, {
  "svix-id": svixId,
  "svix-timestamp": svixTimestamp,
  "svix-signature": svixSignature,
}) as WebhookEvent;
```

### 4. Rate Limiting

**현재 상태**: Rate limiting 미구현

**권장 사항**: 다음 API 엔드포인트에 Rate Limiting 추가
- `/api/submissions` - 이메일 수집
- `/api/contact` - 문의 양식
- `/api/admin/*` - 관리자 API

**구현 예시** (Vercel Edge Config 사용):
```typescript
import { ratelimit } from '@/lib/ratelimit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // 실제 로직...
}
```

### 5. CORS 설정

**현재 상태**: 기본 Next.js CORS 정책 사용

**권장 사항**: 프로덕션 배포 시 허용된 도메인만 설정

```typescript
// src/middleware.ts에 추가
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // CORS 헤더 추가
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  return response;
}
```

---

## 🔍 보안 감사 체크리스트

### 배포 전 확인사항

- [ ] 모든 API 키 재발급 완료
- [ ] `.env.local` 파일이 `.gitignore`에 포함됨
- [ ] Vercel 환경변수 설정 완료
- [ ] Supabase RLS 정책 검토
- [ ] Webhook Secret 검증 테스트
- [ ] XSS 방지 코드 확인
- [ ] CORS 정책 설정
- [ ] Rate Limiting 구현 (권장)

### 정기 보안 점검 (월 1회)

- [ ] 사용하지 않는 API 키 삭제
- [ ] Supabase 액세스 로그 확인
- [ ] Clerk 사용자 활동 모니터링
- [ ] Vercel 배포 로그 확인
- [ ] 의존성 보안 업데이트 확인 (`pnpm audit`)

---

## 📚 추가 리소스

### 공식 보안 가이드
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk Security](https://clerk.com/docs/security/overview)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

### 보안 도구
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - 의존성 취약점 검사
- [Snyk](https://snyk.io/) - 코드 및 의존성 보안 스캔
- [git-secrets](https://github.com/awslabs/git-secrets) - API 키 커밋 방지

---

## 🚨 보안 이슈 발견 시

보안 취약점을 발견한 경우:

1. **즉시 조치**
   - 영향받는 API 키 즉시 재발급
   - 로그 확인하여 악용 여부 점검

2. **팀 공유**
   - 팀원들에게 즉시 알림
   - 영향 범위 파악

3. **문서화**
   - 이슈 내용 및 해결 방법 기록
   - 재발 방지 대책 수립

---

**마지막 업데이트**: 2025-12-17

**작성자**: Claude Code (보안 수정 자동화)
