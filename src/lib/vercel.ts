/**
 * Vercel API 클라이언트 유틸리티
 *
 * Vercel API를 직접 호출하여 배포 상태, 환경변수, 프로젝트 정보 등을 조회합니다.
 * MCP 서버 대신 직접 API를 사용하는 방식입니다.
 *
 * @see https://vercel.com/docs/rest-api
 */

const VERCEL_API_BASE = "https://api.vercel.com";

/**
 * Vercel API 요청 헤더 생성
 */
function getHeaders(): HeadersInit {
  const token = process.env.VERCEL_ACCESS_TOKEN;

  if (!token) {
    throw new Error("VERCEL_ACCESS_TOKEN environment variable is not set");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Vercel API 호출 헬퍼 함수
 */
async function fetchVercelAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${VERCEL_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(`Vercel API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * 배포 목록 조회
 * @param teamId - Team ID (선택사항, Personal Account인 경우 생략)
 * @param projectId - Project ID (선택사항, 특정 프로젝트만 조회)
 */
export async function getDeployments(params?: {
  teamId?: string;
  projectId?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.teamId) searchParams.append("teamId", params.teamId);
  if (params?.projectId) searchParams.append("projectId", params.projectId);
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const query = searchParams.toString();
  const endpoint = `/v6/deployments${query ? `?${query}` : ""}`;

  return fetchVercelAPI<{
    deployments: Array<{
      uid: string;
      name: string;
      url: string;
      state:
        | "BUILDING"
        | "ERROR"
        | "INITIALIZING"
        | "QUEUED"
        | "READY"
        | "CANCELED";
      createdAt: number;
      readyAt?: number;
      buildingAt?: number;
      errorAt?: number;
      target?: string;
      alias?: string[];
    }>;
  }>(endpoint);
}

/**
 * 프로젝트 목록 조회
 * @param teamId - Team ID (선택사항, Personal Account인 경우 생략)
 */
export async function getProjects(teamId?: string) {
  const searchParams = new URLSearchParams();
  if (teamId) searchParams.append("teamId", teamId);

  const query = searchParams.toString();
  const endpoint = `/v9/projects${query ? `?${query}` : ""}`;

  return fetchVercelAPI<{
    projects: Array<{
      id: string;
      name: string;
      accountId: string;
      updatedAt: number;
      createdAt: number;
      targets?: {
        production?: {
          id: string;
        };
      };
    }>;
  }>(endpoint);
}

/**
 * 특정 프로젝트의 환경변수 조회
 * @param projectId - Project ID
 * @param teamId - Team ID (선택사항)
 */
export async function getEnvironmentVariables(params: {
  projectId: string;
  teamId?: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.append("projectId", params.projectId);
  if (params.teamId) searchParams.append("teamId", params.teamId);

  const endpoint = `/v9/projects/${params.projectId}/env?${searchParams.toString()}`;

  return fetchVercelAPI<{
    envs: Array<{
      type: "system" | "secret" | "encrypted" | "plain";
      id: string;
      key: string;
      value?: string;
      target?: ("production" | "preview" | "development")[];
      gitBranch?: string;
      configurationId?: string;
      updatedAt?: number;
      createdAt?: number;
    }>;
  }>(endpoint);
}

/**
 * 배포 상태 조회
 * @param deploymentId - Deployment ID
 * @param teamId - Team ID (선택사항)
 */
export async function getDeployment(deploymentId: string, teamId?: string) {
  const searchParams = new URLSearchParams();
  if (teamId) searchParams.append("teamId", teamId);

  const query = searchParams.toString();
  const endpoint = `/v13/deployments/${deploymentId}${query ? `?${query}` : ""}`;

  return fetchVercelAPI<{
    uid: string;
    name: string;
    url: string;
    state:
      | "BUILDING"
      | "ERROR"
      | "INITIALIZING"
      | "QUEUED"
      | "READY"
      | "CANCELED";
    createdAt: number;
    readyAt?: number;
    buildingAt?: number;
    errorAt?: number;
    target?: string;
    alias?: string[];
    projectId: string;
  }>(endpoint);
}

/**
 * 도메인 목록 조회
 * @param teamId - Team ID (선택사항)
 */
export async function getDomains(teamId?: string) {
  const searchParams = new URLSearchParams();
  if (teamId) searchParams.append("teamId", teamId);

  const query = searchParams.toString();
  const endpoint = `/v5/domains${query ? `?${query}` : ""}`;

  return fetchVercelAPI<{
    domains: Array<{
      id: string;
      name: string;
      createdAt: number;
      expiresAt?: number;
      verified: boolean;
    }>;
  }>(endpoint);
}

/**
 * Team 정보 조회
 */
export async function getTeams() {
  return fetchVercelAPI<{
    teams: Array<{
      id: string;
      name: string;
      slug: string;
      avatar?: string;
      createdAt: number;
    }>;
  }>(`/v2/teams`);
}

/**
 * 새 배포 생성 (GitHub에서 최신 코드로 배포)
 * @param projectId - Project ID 또는 프로젝트 이름
 * @param params - 배포 옵션
 */
export async function createDeployment(params: {
  projectId: string;
  target?: "production" | "preview";
  gitSource?: {
    type: "github";
    org: string;
    repo: string;
    ref?: string; // branch name or commit SHA
  };
}) {
  const body: Record<string, unknown> = {
    name: params.projectId,
    target: params.target || "production",
  };

  if (params.gitSource) {
    body.gitSource = params.gitSource;
  }

  return fetchVercelAPI<{
    id: string;
    url: string;
    name: string;
    state: "BUILDING" | "ERROR" | "INITIALIZING" | "QUEUED" | "READY" | "CANCELED";
    createdAt: number;
    readyState: string;
  }>("/v13/deployments", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * 프로젝트 재배포 (Vercel 대시보드의 Redeploy 기능)
 * 가장 최근 production 배포를 기반으로 재배포
 * @param projectId - Project ID
 */
export async function redeployProject(projectId: string) {
  // 먼저 최근 배포 목록에서 production 배포 찾기
  const { deployments } = await getDeployments({ 
    projectId, 
    limit: 10 
  });
  
  const productionDeployment = deployments.find(d => d.target === "production" && d.state === "READY");
  
  if (!productionDeployment) {
    throw new Error("No production deployment found to redeploy");
  }

  // 해당 배포를 재배포
  return fetchVercelAPI<{
    id: string;
    url: string;
    name: string;
    state: "BUILDING" | "ERROR" | "INITIALIZING" | "QUEUED" | "READY" | "CANCELED";
    createdAt: number;
  }>(`/v13/deployments?forceNew=1`, {
    method: "POST",
    body: JSON.stringify({
      name: productionDeployment.name,
      deploymentId: productionDeployment.uid,
      target: "production",
    }),
  });
}

/**
 * GitHub 저장소에서 최신 코드로 production 배포
 * @param org - GitHub organization 또는 username
 * @param repo - Repository name
 * @param branch - Branch name (기본값: main)
 */
export async function deployFromGitHub(params: {
  org: string;
  repo: string;
  branch?: string;
  projectName?: string;
}) {
  const { org, repo, branch = "main", projectName } = params;
  
  return fetchVercelAPI<{
    id: string;
    url: string;
    name: string;
    state: "BUILDING" | "ERROR" | "INITIALIZING" | "QUEUED" | "READY" | "CANCELED";
    createdAt: number;
    readyState: string;
  }>("/v13/deployments", {
    method: "POST",
    body: JSON.stringify({
      name: projectName || repo,
      target: "production",
      gitSource: {
        type: "github",
        org,
        repo,
        ref: branch,
      },
    }),
  });
}
