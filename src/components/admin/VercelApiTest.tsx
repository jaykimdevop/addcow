"use client";

import { useState } from "react";
import { LuCheck, LuLoader, LuRefreshCw, LuX } from "react-icons/lu";

interface VercelTestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  data?: {
    teams?: {
      count: number;
      teams: Array<{ id: string; name: string; slug: string }>;
    };
    projects?: {
      count: number;
      projects: Array<{
        id: string;
        name: string;
        accountId: string;
        createdAt: string;
      }>;
    };
  };
}

export function VercelApiTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VercelTestResult | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/vercel-test");
      const data: VercelTestResult = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
          >
          {isLoading ? (
            <>
              <LuLoader className="w-4 h-4 animate-spin" />
              테스트 중...
            </>
          ) : (
            <>
              <LuRefreshCw className="w-4 h-4" />
              테스트 실행
            </>
          )}
        </button>
        </div>
      </div>

      {result && (
        <div
          className={`mt-4 p-4 rounded-lg border ${
            result.success
              ? "bg-green-900/20 border-green-700"
              : "bg-red-900/20 border-red-700"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <LuCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <LuX className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3
                className={`font-semibold mb-1 text-sm ${
                  result.success
                    ? "text-green-100"
                    : "text-red-100"
                }`}
              >
                {result.success ? "연결 성공" : "연결 실패"}
              </h3>
              {result.message && (
                <p
                  className={`text-xs mb-2 ${
                    result.success
                      ? "text-green-200"
                      : "text-red-200"
                  }`}
                >
                  {result.message}
                </p>
              )}
              {result.error && (
                <p className="text-xs text-red-200 mb-2">
                  오류: {result.error}
                </p>
              )}
              {result.data && (
                <div className="mt-3 space-y-2">
                  {result.data.teams && (
                    <div>
                      <h4 className="text-xs font-semibold text-white mb-1">
                        Teams ({result.data.teams.count})
                      </h4>
                      {result.data.teams.teams.length > 0 ? (
                        <ul className="text-xs text-neutral-300 space-y-1">
                          {result.data.teams.teams.map((team) => (
                            <li
                              key={team.id}
                              className="flex items-center gap-2"
                            >
                              <span className="font-medium">{team.name}</span>
                              <span className="text-neutral-400">
                                ({team.slug})
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-neutral-400">
                          Personal Account 사용 중
                        </p>
                      )}
                    </div>
                  )}
                  {result.data.projects && (
                    <div>
                      <h4 className="text-xs font-semibold text-white mb-1">
                        Projects ({result.data.projects.count})
                      </h4>
                      {result.data.projects.projects.length > 0 ? (
                        <ul className="text-xs text-neutral-300 space-y-1">
                          {result.data.projects.projects.map((project) => (
                            <li
                              key={project.id}
                              className="flex items-center gap-2"
                            >
                              <span className="font-medium">
                                {project.name}
                              </span>
                              <span className="text-neutral-400">
                                ({project.id})
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-neutral-400">
                          프로젝트가 없습니다
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {result.details && (
                <details className="mt-2">
                  <summary className="text-xs text-neutral-400 cursor-pointer">
                    상세 정보 보기
                  </summary>
                  <pre className="mt-2 text-xs bg-neutral-900 p-2 rounded overflow-auto">
                    {result.details}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
