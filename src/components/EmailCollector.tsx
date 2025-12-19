"use client";

import { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { FcGoogle } from "react-icons/fc";
import { LuLoader, LuTriangleAlert } from "react-icons/lu";
import { event } from "@/lib/analytics";

export function EmailCollector() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, isLoaded: signInLoaded } = useSignIn();

  // 남은 인원 가져오기
  const fetchRemaining = async () => {
    try {
      const response = await fetch("/api/waitlist/count");
      if (!response.ok) {
        throw new Error("Failed to fetch remaining count");
      }
      const data = await response.json();
      setRemaining(data.remaining);
    } catch (error) {
      console.error("Failed to fetch remaining count:", error);
      // 남은 인원 조회 실패는 사용자에게 표시하지 않음 (선택적 정보)
    }
  };

  // 컴포넌트 마운트 시 남은 인원 가져오기
  useEffect(() => {
    fetchRemaining();
    // 1분마다 업데이트
    const interval = setInterval(fetchRemaining, 60000);
    return () => clearInterval(interval);
  }, []);

  // Google OAuth로 직접 로그인
  const handleGoogleSignIn = async () => {
    // Clerk이 아직 로드되지 않았으면 대기
    if (!signInLoaded) {
      setError("인증 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // signIn이 없으면 에러 처리
    if (!signIn) {
      setError("로그인 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Track event
      event({
        action: "sign_in_clicked",
        category: "engagement",
        label: "waitlist_signup",
      });

      // Google OAuth로 직접 리다이렉트
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: window.location.origin + "/sign-in/sso-callback",
        redirectUrlComplete: window.location.origin + "/",
      });
    } catch (err) {
      console.error("Failed to initiate Google sign-in:", err);
      setError(
        err instanceof Error
          ? err.message
          : "로그인 중 오류가 발생했습니다. 다시 시도해주세요."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <div className="flex flex-col gap-2">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading || !signInLoaded}
          className="w-full px-4 py-1.5 rounded-full border bg-white transition-all text-center text-sm font-medium hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            borderColor: 'var(--primary)',
            color: 'var(--primary-dark)',
          }}
        >
          {isLoading ? (
            <>
              <LuLoader className="w-5 h-5 animate-spin" />
              로그인 중...
            </>
          ) : (
            <>
              <FcGoogle className="w-5 h-5" />
              구글 로그인
            </>
          )}
        </button>
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <LuTriangleAlert className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {remaining !== null && remaining > 0 && (
          <p className="text-xs text-center mt-2 opacity-70" style={{ color: 'var(--primary)' }}>
            선착순 300명 한정 • 남은 자리: {remaining}명
          </p>
        )}
      </div>
    </div>
  );
}

