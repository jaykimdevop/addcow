# 페이지 인벤토리

이 문서는 프로젝트의 모든 페이지와 API 라우트를 추적하고 관리합니다. 페이지를 정리할 때 참고하세요.

**최종 업데이트**: 2025-12-17

---

## 페이지 목록

### 공개 페이지 (인증 불필요)

#### 1. `/` (루트)
- **파일**: `src/app/page.tsx`
- **상태**: ✅ 사용 중
- **설명**: 랜딩 페이지 (이메일 수집)
- **의존성**:
  - MVP 모드일 때 → `/addcow`로 리다이렉트
  - 로그인 시 → `/home`으로 리다이렉트
  - `HomeClient` 컴포넌트 사용
- **참조 위치**:
  - `src/app/admin/layout.tsx` - AdminNav에서 홈 링크
  - `src/components/ProfileMenu.tsx` - 로그아웃 후 리다이렉트

#### 2. `/addcow`
- **파일**: `src/app/addcow/page.tsx`
- **상태**: ✅ 조건부 사용 (MVP 모드일 때만)
- **설명**: MVP 모드 랜딩 페이지
- **의존성**:
  - `getSiteMode()` - MVP 모드 확인
  - MVP 모드가 아니면 → `/`로 리다이렉트
- **참조 위치**:
  - `src/app/page.tsx` - MVP 모드일 때 리다이렉트

#### 3. `/sign-in/[...sign-in]`
- **파일**: `src/app/sign-in/[[...sign-in]]/page.tsx`
- **상태**: ✅ 사용 중
- **설명**: Clerk 로그인 페이지 (catch-all)
- **의존성**:
  - Clerk 인증 시스템
  - 로그인 성공 시 → `/admin`으로 리다이렉트
- **참조 위치**:
  - `src/lib/clerk.ts` - `requireAuth()`에서 인증 실패 시 리다이렉트

#### 4. `/sign-in/sso-callback`
- **파일**: `src/app/sign-in/sso-callback/page.tsx`
- **상태**: ✅ 사용 중
- **설명**: SSO 로그인 콜백 페이지
- **의존성**:
  - `EmailCollector.tsx` - Google OAuth 리다이렉트 URL
- **참조 위치**:
  - `src/components/EmailCollector.tsx` - `redirectUrl: window.location.origin + "/sign-in/sso-callback"`

#### 5. `/sign-up/[...sign-up]`
- **파일**: `src/app/sign-up/[[...sign-up]]/page.tsx`
- **상태**: ✅ 사용 중
- **설명**: Clerk 회원가입 페이지 (catch-all)
- **의존성**:
  - Clerk 인증 시스템
  - 회원가입 성공 시 → `/admin`으로 리다이렉트

---

### 인증 필요 페이지 (middleware에서 보호)

#### 6. `/home`
- **파일**: `src/app/home/page.tsx`
- **상태**: ✅ 사용 중
- **설명**: 로그인 후 홈 페이지 (Dock 표시)
- **의존성**:
  - 로그인되지 않았으면 → `/main`으로 리다이렉트 (⚠️ `/main` 페이지는 존재하지 않음 - 버그 가능성)
  - `HomeClient` 컴포넌트 사용
- **참조 위치**:
  - `src/app/page.tsx` - 로그인 시 리다이렉트 (`redirect("/home")`)
  - `src/components/HeroSection.tsx` - Dock에서 홈 버튼 클릭 시 `router.push('/home')` (86줄)
  - `src/middleware.ts` - 보호 경로로 정의 (`/home(.*)`)

#### 7. `/user-profile`
- **파일**: `src/app/user-profile/page.tsx`
- **상태**: ✅ 사용 중
- **설명**: 사용자 프로필 페이지 (Clerk UserProfile 컴포넌트)
- **의존성**:
  - Clerk UserProfile 컴포넌트
- **참조 위치**:
  - `src/middleware.ts` - 보호 경로로 정의

---

### 관리자 페이지 (인증 + 관리자 권한 필요)

#### 8. `/admin`
- **파일**: `src/app/admin/page.tsx`
- **상태**: ✅ 사용 중
- **설명**: 관리자 대시보드 (통계, 차트)
- **의존성**:
  - `AdminLayout` - 관리자 레이아웃
  - `StatsCards`, `SubmissionsChart`, `RecentSubmissions` 컴포넌트
- **참조 위치**:
  - `src/components/admin/AdminNav.tsx` - 네비게이션 링크
  - `src/app/sign-in/[[...sign-in]]/page.tsx` - 로그인 성공 시 리다이렉트
  - `src/components/profile/ProfileMenu.tsx` - 프로필 메뉴에서 링크
  - `src/middleware.ts` - 보호 경로로 정의

#### 9. `/admin/submissions`
- **파일**: `src/app/admin/submissions/page.tsx`
- **상태**: ✅ 사용 중
- **설명**: 제출 데이터 목록 및 관리
- **의존성**:
  - `SubmissionsTable` 컴포넌트
- **참조 위치**:
  - `src/components/admin/AdminNav.tsx` - 네비게이션 링크

#### 10. `/admin/users`
- **파일**: `src/app/admin/users/page.tsx`
- **상태**: ✅ 사용 중 (admin 권한만)
- **설명**: 관리자 사용자 관리
- **의존성**:
  - `UsersTable` 컴포넌트
- **참조 위치**:
  - `src/components/admin/AdminNav.tsx` - 네비게이션 링크 (admin만 표시)

#### 11. `/admin/settings`
- **파일**: `src/app/admin/settings/page.tsx`
- **상태**: ✅ 사용 중 (admin 권한만)
- **설명**: 사이트 설정 (모드 전환 등)
- **의존성**:
  - `SiteModeToggle` 컴포넌트
- **참조 위치**:
  - `src/components/admin/AdminNav.tsx` - 네비게이션 링크 (admin만 표시)

#### 12. `/admin/export`
- **파일**: `src/app/admin/export/page.tsx`
- **상태**: ✅ 사용 중 (admin 권한만)
- **설명**: 데이터 CSV 내보내기
- **의존성**:
  - `/api/admin/export` API 호출
- **참조 위치**:
  - `src/components/admin/AdminNav.tsx` - 네비게이션 링크 (admin만 표시)

---

### 디버그 페이지

#### 13. `/debug-user`
- **파일**: `src/app/debug-user/page.tsx`
- **상태**: ⚠️ 개발용 (프로덕션에서 제거 고려)
- **설명**: 사용자 디버깅 정보 표시
- **의존성**:
  - Clerk 인증 정보
  - Supabase admin_users 테이블 조회
- **참조 위치**: 없음 (직접 URL 접근)

---

### 미구현 경로 (middleware에만 정의, 실제 페이지 없음)

다음 경로들은 `src/middleware.ts`에 보호 경로로 정의되어 있지만, 실제 페이지 파일이 없습니다:

#### `/node`
- **상태**: ⚠️ 미구현
- **정의 위치**: `src/middleware.ts` (7줄)
- **참조 위치**: `src/components/HeroSection.tsx` (91줄) - Dock에서 `router.push('/node')`
- **설명**: 노드 관련 기능 (아직 구현되지 않음)

#### `/asset`
- **상태**: ⚠️ 미구현
- **정의 위치**: `src/middleware.ts` (8줄)
- **참조 위치**: `src/components/HeroSection.tsx` (96줄) - Dock에서 `router.push('/asset')`
- **설명**: 작업물 관련 기능 (아직 구현되지 않음)

#### `/knowledge`
- **상태**: ⚠️ 미구현
- **정의 위치**: `src/middleware.ts` (9줄)
- **참조 위치**: `src/components/HeroSection.tsx` (101줄) - Dock에서 `router.push('/knowledge')`
- **설명**: 업로드/지식 관련 기능 (아직 구현되지 않음)

#### `/profile`
- **상태**: ⚠️ 미구현 (혼동 주의)
- **정의 위치**: `src/middleware.ts` (10줄)
- **참조 위치**: `src/components/HeroSection.tsx` (118줄) - Dock에서 `router.push('/profile')`
- **설명**: 프로필 페이지 (Dock에서 참조하지만 실제 페이지는 `/user-profile`)
- **참고**: `/user-profile`는 존재하지만, Dock에서는 `/profile`로 라우팅하고 있습니다.

#### `/main`
- **상태**: ⚠️ 미구현 (버그 가능성)
- **정의 위치**: 없음
- **참조 위치**: `src/app/home/page.tsx` (12줄) - 로그인되지 않았을 때 `redirect("/main")`
- **설명**: `/home` 페이지에서 로그인되지 않은 사용자를 리다이렉트하려고 하지만 실제 페이지가 없음
- **권장 조치**: `/home/page.tsx`의 리다이렉트를 `/` 또는 `/sign-in`으로 수정 필요

---

## API 라우트 목록

### 공개 API

#### 1. `POST /api/submissions`
- **파일**: `src/app/api/submissions/route.ts`
- **상태**: ✅ 사용 중
- **설명**: 이메일 제출 처리
- **참조 위치**:
  - `src/components/EmailCollector.tsx` (간접적으로 사용될 수 있음)

#### 2. `GET /api/waitlist/count`
- **파일**: `src/app/api/waitlist/count/route.ts`
- **상태**: ✅ 사용 중
- **설명**: 대기자 목록 남은 인원 조회
- **참조 위치**:
  - `src/components/EmailCollector.tsx` - `fetch("/api/waitlist/count")`

#### 3. `POST /api/contact`
- **파일**: `src/app/api/contact/route.ts`
- **상태**: ✅ 사용 중
- **설명**: 문의 폼 제출
- **참조 위치**:
  - `src/components/mvp/ContactForm.tsx` - `fetch("/api/contact")`

---

### 관리자 전용 API

#### 4. `GET /api/admin/users`
- **파일**: `src/app/api/admin/users/route.ts`
- **상태**: ✅ 사용 중
- **설명**: 관리자 사용자 목록 조회
- **참조 위치**:
  - `src/components/admin/UsersTable.tsx` - `fetch("/api/admin/users")`

#### 5. `POST /api/admin/users`
- **파일**: `src/app/api/admin/users/route.ts`
- **상태**: ✅ 사용 중
- **설명**: 관리자 사용자 생성
- **참조 위치**:
  - `src/components/admin/UsersTable.tsx` (사용자 생성 시)

#### 6. `DELETE /api/admin/users/[id]`
- **파일**: `src/app/api/admin/users/[id]/route.ts`
- **상태**: ✅ 사용 중
- **설명**: 관리자 사용자 삭제
- **참조 위치**:
  - `src/components/admin/UsersTable.tsx` - `fetch(\`/api/admin/users/${id}\`)`

#### 7. `GET /api/admin/export`
- **파일**: `src/app/api/admin/export/route.ts`
- **상태**: ✅ 사용 중
- **설명**: 데이터 CSV 내보내기
- **참조 위치**:
  - `src/app/admin/export/page.tsx` - `fetch(\`/api/admin/export?${params}\`)`

#### 8. `POST /api/admin/settings`
- **파일**: `src/app/api/admin/settings/route.ts`
- **상태**: ✅ 사용 중
- **설명**: 사이트 설정 업데이트
- **참조 위치**:
  - `src/components/admin/SiteModeToggle.tsx` - `fetch("/api/admin/settings")`

#### 9. `POST /api/admin/create-accounts`
- **파일**: `src/app/api/admin/create-accounts/route.ts`
- **상태**: ✅ 사용 중
- **설명**: 대기자 계정 일괄 생성
- **참조 위치**:
  - `src/components/admin/SiteModeToggle.tsx` - `fetch("/api/admin/create-accounts")`

#### 10. `POST /api/admin/notify-waitlist`
- **파일**: `src/app/api/admin/notify-waitlist/route.ts`
- **상태**: ✅ 사용 중
- **설명**: 대기자 알림 전송
- **참조 위치**:
  - `src/components/admin/SiteModeToggle.tsx` - `fetch("/api/admin/notify-waitlist")`

#### 11. `GET /api/admin/vercel-test`
- **파일**: `src/app/api/admin/vercel-test/route.ts`
- **상태**: ✅ 사용 중
- **설명**: Vercel API 테스트
- **참조 위치**:
  - `src/components/admin/VercelApiTest.tsx` - `fetch("/api/admin/vercel-test")`

---

### 웹훅

#### 12. `POST /api/webhooks/clerk`
- **파일**: `src/app/api/webhooks/clerk/route.ts`
- **상태**: ✅ 사용 중
- **설명**: Clerk 웹훅 수신 (서명 검증)
- **참조 위치**:
  - Clerk 대시보드에서 설정
  - `src/middleware.ts` - 웹훅 라우트는 인증 제외

---

## 페이지 상태 요약

### 사용 중 (13개)
- `/`, `/addcow`, `/sign-in/*`, `/sign-up/*`, `/home`, `/user-profile`
- `/admin`, `/admin/submissions`, `/admin/users`, `/admin/settings`, `/admin/export`
- `/debug-user`

### 미구현 (5개)
- `/node`, `/asset`, `/knowledge`, `/profile` (middleware에만 정의)
- `/main` (참조되지만 페이지 없음 - 버그 가능성)

### API 라우트 (12개)
- 모두 사용 중

---

## 의존성 맵

### 주요 리다이렉트 흐름

```
/ (루트)
├─ MVP 모드 → /addcow
├─ 로그인됨 → /home
└─ 로그인 안됨 → HomeClient (이메일 수집)

/home
└─ 로그인 안됨 → /main (⚠️ 페이지 없음)

/admin/*
└─ 인증 안됨 → /sign-in
└─ 권한 없음 → /
```

### 컴포넌트 의존성

- `HomeClient` → `/`, `/home`에서 사용
- `AdminNav` → 모든 `/admin/*` 페이지에서 사용
- `HeroSection` → Dock에서 `/home`, `/node`, `/asset`, `/knowledge`, `/profile`로 라우팅

---

## 정리 시 주의사항

1. **미구현 경로 정리 시**:
   - `src/middleware.ts`에서 보호 경로 제거
   - `src/components/HeroSection.tsx`에서 Dock 항목 제거

2. **디버그 페이지 정리 시**:
   - `/debug-user`는 개발용이므로 프로덕션에서 제거 고려

3. **API 라우트 정리 시**:
   - 프론트엔드에서 호출하는 위치 확인 필요
   - 데이터베이스 마이그레이션 필요 여부 확인

---

## 업데이트 가이드

이 문서는 수동으로 업데이트하거나, `scripts/update-page-inventory.js` 스크립트를 실행하여 자동으로 업데이트할 수 있습니다.

