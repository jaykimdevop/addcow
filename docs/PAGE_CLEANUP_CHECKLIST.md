# 페이지 정리 체크리스트

페이지를 삭제하기 전에 이 체크리스트를 확인하세요. 안전하게 정리할 수 있도록 도와줍니다.

---

## 페이지 삭제 전 체크리스트

### 1. 의존성 확인

#### 다른 페이지에서 참조되는지 확인
- [ ] `redirect()` 호출에서 사용되지 않음
- [ ] `router.push()` 호출에서 사용되지 않음
- [ ] `Link` 컴포넌트의 `href`에서 사용되지 않음
- [ ] 다른 컴포넌트에서 직접 import되지 않음

**확인 방법**:
```bash
# 프로젝트 루트에서 실행
grep -r "경로명" src/
```

#### API 라우트가 사용되는지 확인
- [ ] 프론트엔드에서 `fetch()` 호출이 없음
- [ ] 다른 API 라우트에서 호출되지 않음
- [ ] 외부 서비스(웹훅 등)에서 호출되지 않음

**확인 방법**:
```bash
# API 경로 검색
grep -r "/api/경로명" src/
```

---

### 2. Middleware 설정 확인

#### 보호 경로에서 제거 필요 여부
- [ ] `src/middleware.ts`의 `isProtectedRoute`에서 제거 필요
- [ ] `isWebhookRoute`에서 제거 필요 (API 라우트인 경우)
- [ ] 다른 보호 경로 패턴에 포함되지 않음

**확인 위치**: `src/middleware.ts`

---

### 3. 컴포넌트 정리

#### 관련 컴포넌트 확인
- [ ] 페이지 전용 컴포넌트가 있는지 확인
- [ ] 다른 페이지에서도 사용되는 컴포넌트인지 확인
- [ ] 공유 컴포넌트는 삭제하지 않음

**확인 위치**: `src/components/` 디렉토리

---

### 4. 데이터베이스 및 설정

#### 데이터베이스 마이그레이션
- [ ] 관련 테이블이 있는지 확인
- [ ] 테이블 삭제가 필요한지 확인
- [ ] 마이그레이션 파일 생성 필요 여부

#### 환경변수 및 설정
- [ ] 환경변수에서 참조되지 않음
- [ ] 설정 파일에서 참조되지 않음

---

### 5. 정적 파일 및 리소스

#### 정적 파일
- [ ] 페이지에서 사용하는 이미지, 아이콘 등 정리
- [ ] `public/` 디렉토리의 관련 파일 확인

---

## 페이지별 정리 가이드

### 공개 페이지 정리

#### 예시: `/addcow` 페이지 삭제 시

1. **의존성 확인**:
   - [ ] `src/app/page.tsx`에서 `/addcow`로 리다이렉트하는 코드 제거
   - [ ] `getSiteMode()` 함수에서 MVP 모드 관련 로직 확인

2. **컴포넌트 확인**:
   - [ ] `src/components/mvp/` 디렉토리의 컴포넌트들 확인
   - [ ] 다른 곳에서 사용되는지 확인

3. **설정 확인**:
   - [ ] `site_settings` 테이블의 `site_mode` 값 확인
   - [ ] MVP 모드 관련 설정 제거 필요 여부

---

### 인증 필요 페이지 정리

#### 예시: `/home` 페이지 삭제 시

1. **의존성 확인**:
   - [ ] `src/app/page.tsx`에서 `/home`으로 리다이렉트하는 코드 제거
   - [ ] `src/components/HeroSection.tsx`에서 Dock의 홈 버튼 제거
   - [ ] `src/middleware.ts`에서 `/home(.*)` 보호 경로 제거

2. **컴포넌트 확인**:
   - [ ] `HomeClient` 컴포넌트가 다른 곳에서도 사용되는지 확인
   - [ ] `Dock` 컴포넌트 수정 필요

---

### 관리자 페이지 정리

#### 예시: `/admin/export` 페이지 삭제 시

1. **의존성 확인**:
   - [ ] `src/components/admin/AdminNav.tsx`에서 네비게이션 링크 제거
   - [ ] `/api/admin/export` API 라우트도 함께 삭제 필요

2. **API 라우트 확인**:
   - [ ] `src/app/api/admin/export/route.ts` 삭제
   - [ ] 프론트엔드에서 호출하는 곳이 없는지 확인

---

### API 라우트 정리

#### 예시: `/api/admin/vercel-test` 삭제 시

1. **프론트엔드 확인**:
   - [ ] `src/components/admin/VercelApiTest.tsx` 컴포넌트 확인
   - [ ] 다른 곳에서 호출하지 않는지 확인

2. **관련 페이지 확인**:
   - [ ] 관리자 페이지에서 사용하는지 확인
   - [ ] 컴포넌트도 함께 삭제 필요 여부

---

## 미구현 경로 정리 가이드

### `/node`, `/asset`, `/knowledge`, `/profile` 정리 시

이 경로들은 middleware에만 정의되어 있고 실제 페이지가 없습니다.

#### 체크리스트:

1. **Middleware 수정**:
   - [ ] `src/middleware.ts`의 `isProtectedRoute`에서 제거
   ```typescript
   // 제거할 항목:
   "/node(.*)",
   "/asset(.*)",
   "/knowledge(.*)",
   "/profile(.*)"
   ```

2. **컴포넌트 수정**:
   - [ ] `src/components/HeroSection.tsx`의 Dock에서 해당 항목 제거
   ```typescript
   // Dock items 배열에서 제거:
   {
     icon: <VscGitCommit size={18} />,
     label: '노드',
     onClick: () => router.push('/node')  // 제거
   },
   // ... 다른 항목들도 동일하게
   ```

3. **참고사항**:
   - `/profile`은 `/user-profile`와 혼동될 수 있으므로 주의
   - Dock에서 `/profile`로 라우팅하지만 실제 페이지는 `/user-profile`

---

## 삭제 절차

### 1단계: 백업
- [ ] Git 커밋 (현재 상태 저장)
- [ ] 브랜치 생성 (필요 시)

### 2단계: 의존성 제거
- [ ] 다른 파일에서 참조하는 코드 제거
- [ ] 컴포넌트에서 사용하는 부분 제거
- [ ] Middleware 설정 수정

### 3단계: 파일 삭제
- [ ] 페이지 파일 삭제 (`src/app/경로/page.tsx`)
- [ ] API 라우트 파일 삭제 (해당하는 경우)
- [ ] 레이아웃 파일 삭제 (해당하는 경우)

### 4단계: 테스트
- [ ] 빌드 테스트: `pnpm build`
- [ ] 개발 서버 테스트: `pnpm dev`
- [ ] 관련 기능 동작 확인

### 5단계: 문서 업데이트
- [ ] `docs/PAGE_INVENTORY.md` 업데이트
- [ ] README.md 업데이트 (필요 시)

---

## 주의사항

### 삭제하지 말아야 할 것들

1. **공유 컴포넌트**: 여러 페이지에서 사용하는 컴포넌트는 삭제하지 않음
2. **유틸리티 함수**: `src/lib/` 디렉토리의 공통 함수들
3. **타입 정의**: `src/types/` 디렉토리의 타입 정의들
4. **설정 파일**: `next.config.ts`, `tsconfig.json` 등

### 복구 방법

실수로 삭제한 경우:
```bash
# Git으로 복구
git checkout HEAD -- src/app/경로/page.tsx

# 또는 특정 커밋에서 복구
git checkout <commit-hash> -- src/app/경로/page.tsx
```

---

## 정리 후 확인

### 빌드 확인
```bash
pnpm build
```

### 린트 확인
```bash
pnpm lint
```

### 타입 체크
```bash
pnpm tsc --noEmit
```

---

## 템플릿 사용법

1. 정리할 페이지를 선택
2. 위의 체크리스트를 복사하여 사용
3. 각 항목을 확인하고 체크
4. 모든 항목이 확인되면 삭제 진행
5. 삭제 후 테스트 및 문서 업데이트

---

**마지막 업데이트**: 2025-12-17

