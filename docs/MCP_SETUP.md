# Cursor MCP 설정 가이드

이 문서는 Cursor AI가 Supabase, Clerk, GitHub, Vercel, GA4, GTM 등 다양한 서비스에 접근할 수 있도록 MCP (Model Context Protocol) 서버를 설정하는 방법을 안내합니다.

## 지원 서비스

### ✅ 공식 MCP 서버 제공
- **Supabase**: 데이터베이스 스키마, 테이블 구조, RLS 정책 조회
- **GitHub**: 저장소 정보, 이슈, PR, 코드 검색
- **Google Analytics 4 (GA4)**: 실시간 사용자 수, 페이지뷰, 이벤트 트래킹

### 🔧 API 직접 사용
- **Vercel**: MCP 서버 대신 Vercel REST API를 직접 사용합니다. (`src/lib/vercel.ts` 참조)

### ⚠️ 공식 MCP 서버 미제공
- **Clerk**: 공식 MCP 서버가 없습니다. 환경변수를 통해 정보를 참조할 수 있습니다.
- **Google Tag Manager (GTM)**: 공식 MCP 서버가 없습니다. GA4 MCP를 통해 간접적으로 확인할 수 있습니다.

## MCP란?

MCP (Model Context Protocol)는 Cursor AI가 외부 서비스와 상호작용할 수 있도록 하는 프로토콜입니다. MCP 서버를 설정하면 AI가 데이터베이스 구조를 확인하고, API를 호출하고, 서비스 상태를 조회할 수 있습니다.

## 설정 방법

### 1. MCP 설정 파일 생성

1. 프로젝트 루트에 `.cursor` 디렉토리가 있는지 확인
2. `.cursor/mcp.json.example` 파일을 복사하여 `.cursor/mcp.json` 생성:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

3. `.cursor/mcp.json` 파일을 열어 각 서비스의 토큰을 입력

### 2. Supabase MCP 설정

**Access Token 생성:**
1. Supabase Dashboard → 우측 상단 프로필 아이콘 클릭
2. **Account Settings** → **Access Tokens**
3. **"Generate new token"** 클릭
4. Token name 입력 (예: `cursor-mcp`)
5. 생성된 토큰 복사 (다시 볼 수 없으므로 안전한 곳에 보관)

**설정:**
`.cursor/mcp.json` 파일에서 `YOUR_SUPABASE_ACCESS_TOKEN`을 실제 토큰으로 교체:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      ]
    }
  }
}
```

**기능:**
- 데이터베이스 스키마 조회
- 테이블 구조 확인
- RLS 정책 확인
- 데이터 조회 (읽기 전용)

### 3. GitHub MCP 설정

**Personal Access Token 생성:**
1. GitHub → 우측 상단 프로필 아이콘 클릭
2. **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **"Generate new token (classic)"** 클릭
4. Token name 입력 (예: `cursor-mcp`)
5. 필요한 권한 선택:
   - `repo` (전체): 저장소 접근
   - `read:org` (선택): 조직 정보 읽기
6. **"Generate token"** 클릭
7. 생성된 토큰 복사 (다시 볼 수 없으므로 안전한 곳에 보관)

**설정:**
`.cursor/mcp.json` 파일에 추가:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github@latest"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

**기능:**
- 저장소 정보 조회
- 이슈 및 PR 확인
- 코드 검색
- 브랜치 관리

### 4. Vercel API 설정

**Access Token 생성:**
1. Vercel Dashboard → 우측 상단 프로필 아이콘 클릭
2. **Settings** → **Tokens** (Personal Account에서)
3. **"Create Token"** 클릭
4. Token name 입력 (예: `addcow-api`)
5. Scope 선택:
   - `Full Account` (전체 접근 권한)
6. **"Create"** 클릭
7. 생성된 토큰 복사 (다시 볼 수 없으므로 안전한 곳에 보관)

**설정:**
`.env.local` 파일에 추가:

```env
VERCEL_ACCESS_TOKEN=your_vercel_access_token
```

**사용 방법:**
Vercel API는 MCP 서버 대신 직접 API를 호출하는 방식으로 구현되어 있습니다.

`src/lib/vercel.ts` 파일에서 다음 함수들을 사용할 수 있습니다:
- `getDeployments()` - 배포 목록 조회
- `getProjects()` - 프로젝트 목록 조회
- `getEnvironmentVariables()` - 환경변수 조회
- `getDeployment()` - 특정 배포 상태 조회
- `getDomains()` - 도메인 목록 조회
- `getTeams()` - Team 정보 조회

**예시:**
```typescript
import { getDeployments, getProjects } from '@/lib/vercel';

// 배포 목록 조회
const { deployments } = await getDeployments({ limit: 10 });

// 프로젝트 목록 조회
const { projects } = await getProjects();
```

**기능:**
- 배포 상태 확인
- 환경변수 조회
- 프로젝트 정보 확인
- 도메인 관리

### 5. Google Analytics 4 (GA4) MCP 설정

**Service Account 생성:**
1. Google Cloud Console → **IAM & Admin** → **Service Accounts**
2. **"Create Service Account"** 클릭
3. Service account name 입력 (예: `cursor-mcp`)
4. **"Create and Continue"** 클릭
5. Role 선택:
   - `Viewer` (GA4 데이터 읽기)
6. **"Continue"** → **"Done"** 클릭
7. 생성된 Service Account 클릭
8. **"Keys"** 탭 → **"Add Key"** → **"Create new key"**
9. Key type: **JSON** 선택
10. 다운로드된 JSON 파일을 프로젝트 루트의 안전한 위치에 저장 (예: `.secrets/ga4-service-account.json`)

**GA4 속성 ID 확인:**
1. Google Analytics → **Admin** → **Property Settings**
2. **Property ID** 복사 (예: `123456789`)

**설정:**
`.cursor/mcp.json` 파일에 추가:

```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-google-analytics@latest"
      ],
      "env": {
        "GOOGLE_ANALYTICS_PROPERTY_ID": "123456789",
        "GOOGLE_APPLICATION_CREDENTIALS": ".secrets/ga4-service-account.json"
      }
    }
  }
}
```

**기능:**
- 실시간 사용자 수 확인
- 페이지뷰 통계 조회
- 이벤트 트래킹 확인
- 사용자 행동 분석

### 6. Google Tag Manager (GTM) MCP 설정

GTM은 현재 공식 MCP 서버가 제공되지 않습니다. 대신 Google Analytics MCP를 통해 GTM 컨테이너 정보를 확인할 수 있습니다.

또는 GTM API를 직접 사용하는 커스텀 MCP 서버를 개발할 수 있습니다.

### 7. Clerk MCP 설정

Clerk는 현재 공식 MCP 서버가 제공되지 않습니다. Clerk API를 직접 사용하는 커스텀 MCP 서버를 개발하거나, 환경변수를 통해 Clerk 정보를 AI가 참조하도록 할 수 있습니다.

## 전체 설정 예시

`.cursor/mcp.json` 파일 전체 예시:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      ]
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github@latest"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    },
    "google-analytics": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-google-analytics@latest"
      ],
      "env": {
        "GOOGLE_ANALYTICS_PROPERTY_ID": "123456789",
        "GOOGLE_APPLICATION_CREDENTIALS": ".secrets/ga4-service-account.json"
      }
    }
  }
}
```

## 보안 주의사항

### ⚠️ 중요

1. **`.cursor/mcp.json` 파일은 절대 Git에 커밋하지 마세요**
   - `.gitignore`에 이미 추가되어 있습니다
   - 토큰이 노출되면 보안 위험이 있습니다

2. **Service Account JSON 파일도 Git에 커밋하지 마세요**
   - `.secrets/` 디렉토리를 `.gitignore`에 추가하세요

3. **토큰 권한 최소화**
   - 필요한 최소한의 권한만 부여하세요
   - 정기적으로 토큰을 갱신하세요

4. **환경별 분리**
   - 개발/프로덕션 환경별로 다른 토큰 사용 권장

## Cursor 재시작

설정을 완료한 후:

1. Cursor를 완전히 종료
2. Cursor를 다시 실행
3. MCP 서버가 활성화되었는지 확인

## 문제 해결

### MCP 서버가 작동하지 않는 경우

1. **토큰 확인**
   - 토큰이 올바르게 입력되었는지 확인
   - 토큰이 만료되지 않았는지 확인

2. **경로 확인**
   - Service Account JSON 파일 경로가 올바른지 확인
   - 상대 경로는 프로젝트 루트 기준입니다

3. **권한 확인**
   - 토큰에 필요한 권한이 부여되었는지 확인

4. **로그 확인**
   - Cursor의 개발자 도구에서 MCP 서버 로그 확인

### 특정 서비스가 작동하지 않는 경우

- 해당 서비스의 공식 MCP 서버 문서 확인
- MCP 서버 버전이 최신인지 확인 (`@latest` 사용)
- 네트워크 연결 확인

## 추가 리소스

- [Cursor MCP 문서](https://docs.cursor.com/mcp)
- [Supabase MCP 서버](https://github.com/supabase/mcp-server-supabase)
- [GitHub MCP 서버](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [Vercel REST API 문서](https://vercel.com/docs/rest-api)
- [Google Analytics MCP 서버](https://github.com/modelcontextprotocol/servers/tree/main/src/google-analytics)

## 다음 단계

MCP 설정이 완료되면:

1. Cursor에서 AI에게 데이터베이스 구조를 물어보기
2. GitHub 저장소 정보 확인 요청
3. Vercel API를 통해 배포 상태 확인 (`src/lib/vercel.ts` 사용)
4. GA4 통계 조회 요청

AI가 이제 프로젝트의 모든 서비스에 접근할 수 있습니다!

