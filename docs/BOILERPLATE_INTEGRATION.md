# Boilerplate 통합 가이드

이 문서는 부트캠프 boilerplate 코드와 현재 프로젝트를 비교하여 추가된 기능과 사용자가 직접 수행해야 할 작업들을 정리합니다.

## 추가된 기능

### 1. Clerk + Supabase 네이티브 통합

**파일:**
- `src/lib/supabase/clerk-client.ts`: Client Component용 Clerk 통합 클라이언트
- `src/lib/supabase/server.ts`: Server Component용 Clerk 통합 클라이언트 추가

**사용 방법:**

**Client Component에서:**
```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();
  
  // RLS 정책이 Clerk 인증을 자동으로 인식합니다
  const { data } = await supabase.from('table').select('*');
}
```

**Server Component에서:**
```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = await createClerkSupabaseClient();
  
  // RLS 정책이 Clerk 인증을 자동으로 인식합니다
  const { data } = await supabase.from('table').select('*');
}
```

### 2. Supabase Storage 설정

**파일:**
- `supabase/migrations/004_setup_storage.sql`: Storage 버킷 및 RLS 정책 설정

**기능:**
- `uploads` 버킷 생성 (Private, 6MB 제한)
- 인증된 사용자만 자신의 폴더에 파일 업로드/조회/삭제 가능
- 폴더 구조: `{clerk_user_id}/filename.ext`

### 3. Clerk 한국어 로컬라이제이션

**파일:**
- `src/app/layout.tsx`: `koKR` 로컬라이제이션 추가

**효과:**
- Clerk 인증 UI가 한국어로 표시됩니다

## 사용자가 직접 수행해야 할 작업

### ✅ 필수 작업

#### 1. Supabase에서 Clerk 3rd Party Auth 설정

**왜 필요한가?**
- Clerk JWT 토큰을 Supabase가 검증할 수 있도록 설정해야 합니다
- 이 설정이 없으면 RLS 정책이 Clerk 인증을 인식하지 못합니다

**단계:**

1. **Clerk Frontend API URL 확인**
   - Clerk Dashboard → **API Keys** 메뉴
   - **"Frontend API"** URL 복사 (예: `https://your-app-12.clerk.accounts.dev`)

2. **Supabase에서 설정**
   - Supabase Dashboard → 프로젝트 선택
   - **Settings** → **Authentication** → **Providers**
   - 페이지 하단 **"Third-Party Auth"** 섹션으로 스크롤
   - **"Enable Custom Access Token"** 또는 **"Add Provider"** 클릭
   - 다음 정보 입력:
     - **Provider Name**: `Clerk`
     - **JWT Issuer (Issuer URL)**: `https://your-app-12.clerk.accounts.dev` (실제 URL로 교체)
     - **JWKS Endpoint (JWKS URI)**: `https://your-app-12.clerk.accounts.dev/.well-known/jwks.json` (동일하게 실제 URL로 교체)
   - **"Save"** 클릭

**참고:**
- [Clerk 공식 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- 이 설정은 코드 변경 없이 Supabase Dashboard에서만 수행하면 됩니다

#### 2. Supabase Storage 버킷 생성 및 마이그레이션 실행

**단계:**

1. **Storage 버킷 생성**
   - Supabase Dashboard → **Storage** 메뉴
   - **"New bucket"** 클릭
   - 버킷 정보 입력:
     - **Name**: `uploads` (마이그레이션 파일과 동일하게)
     - **Public bucket**: ❌ 체크 해제 (Private 버킷)
   - **"Create bucket"** 클릭

2. **Storage 마이그레이션 실행**
   - Supabase Dashboard → **SQL Editor** 메뉴
   - **"New query"** 클릭
   - `supabase/migrations/004_setup_storage.sql` 파일 내용 복사하여 붙여넣기
   - **"Run"** 클릭하여 실행
   - 성공 메시지 확인

**참고:**
- 버킷 이름은 반드시 `uploads`여야 합니다 (환경변수와 일치)
- Public 버킷으로 설정하면 RLS 정책이 적용되지 않습니다

#### 3. 환경변수 추가

**`.env.local` 파일에 추가:**

```env
# Supabase Storage
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

**Vercel 환경변수에도 추가:**
- Vercel Dashboard → 프로젝트 → **Settings** → **Environment Variables**
- `NEXT_PUBLIC_STORAGE_BUCKET` = `uploads` 추가

### ⚠️ 주의사항

1. **Clerk 3rd Party Auth 설정은 필수입니다**
   - 이 설정 없이는 RLS 정책이 Clerk 인증을 인식하지 못합니다
   - 관리자 페이지에서 데이터 조회 시 권한 오류가 발생할 수 있습니다

2. **Storage 버킷 이름은 환경변수와 일치해야 합니다**
   - 마이그레이션 파일: `uploads`
   - 환경변수: `NEXT_PUBLIC_STORAGE_BUCKET=uploads`

3. **기존 Supabase 클라이언트와의 차이**
   - `src/lib/supabase/client.ts`: 공개 데이터용 (Clerk 통합 없음)
   - `src/lib/supabase/clerk-client.ts`: 인증 필요 데이터용 (Clerk 통합)
   - `src/lib/supabase/server.ts`: 
     - `createClient()`: 공개 데이터용
     - `createClerkSupabaseClient()`: 인증 필요 데이터용 (Clerk 통합)

## 테스트 방법

### Clerk + Supabase 통합 테스트

1. 관리자로 로그인
2. 관리자 페이지에서 데이터 조회 시도
3. RLS 정책이 올바르게 작동하는지 확인

### Storage 테스트

1. 관리자로 로그인
2. 파일 업로드 기능이 있는 페이지에서 테스트
3. 자신의 폴더에만 파일이 업로드되는지 확인

## 문제 해결

### RLS 정책 오류

**증상:** "new row violates row-level security policy" 오류

**해결:**
1. Supabase에서 Clerk 3rd Party Auth 설정이 완료되었는지 확인
2. Clerk Frontend API URL이 올바른지 확인
3. JWKS Endpoint URL이 올바른지 확인

### Storage 접근 오류

**증상:** 파일 업로드/조회 시 권한 오류

**해결:**
1. Storage 버킷이 Private으로 설정되었는지 확인
2. 마이그레이션 파일이 실행되었는지 확인
3. 환경변수 `NEXT_PUBLIC_STORAGE_BUCKET`가 설정되었는지 확인

## 추가 리소스

- [Clerk + Supabase 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [Supabase RLS 정책 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [MCP 설정 가이드](./MCP_SETUP.md): Cursor AI가 모든 서비스에 접근할 수 있도록 설정

