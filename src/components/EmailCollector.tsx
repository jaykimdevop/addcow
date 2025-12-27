"use client";

import { useSignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { LuLoader, LuMail, LuTriangleAlert } from "react-icons/lu";
import { event } from "@/lib/analytics";
import type { SiteMode } from "@/lib/site-settings";

interface EmailCollectorProps {
  siteMode: SiteMode;
}

export function EmailCollector({ siteMode }: EmailCollectorProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitlistLoading, setIsWaitlistLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
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
    // 5분마다 업데이트 (성능 최적화)
    const interval = setInterval(fetchRemaining, 5 * 60 * 1000);
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
          : "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
      );
        setIsLoading(false);
    }
  };

  // 대기자 등록 처리
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = waitlistEmail.toLowerCase().trim();
    if (!normalizedEmail) {
      setError("이메일을 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setIsWaitlistLoading(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          setError("이미 등록된 이메일입니다.");
        } else {
          setError("등록 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
        setIsWaitlistLoading(false);
        return;
      }

      setWaitlistSuccess(true);
      setWaitlistEmail("");
      setShowWaitlistForm(false);
      await fetchRemaining();

      setTimeout(() => setWaitlistSuccess(false), 3000);
    } catch (err) {
      setError("등록 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsWaitlistLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <div className="flex flex-col gap-2">
        {/* 대기자 등록 성공 메시지 */}
        {waitlistSuccess && (
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 text-sm">
            대기자 등록이 완료되었습니다!
          </div>
        )}

        {/* 대기자 등록 폼 (FD 모드에서 버튼 클릭 시 표시) */}
        {showWaitlistForm && siteMode === "faked_door" && (
          <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요"
                disabled={isWaitlistLoading}
                className="w-full pl-9 pr-4 py-1.5 rounded-full border bg-white text-sm text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--primary)" }}
              />
            </div>
            <button
              type="submit"
              disabled={isWaitlistLoading || !waitlistEmail.trim()}
              className="px-4 py-1.5 rounded-full border bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isWaitlistLoading ? <LuLoader className="w-4 h-4 animate-spin" /> : "등록"}
            </button>
            <button
              type="button"
              onClick={() => setShowWaitlistForm(false)}
              className="px-3 py-1.5 rounded-full border border-neutral-600 text-neutral-300 text-sm hover:bg-neutral-800"
            >
              취소
            </button>
          </form>
        )}

        {/* 버튼 영역 */}
        {!showWaitlistForm && !waitlistSuccess && (
          <div className="flex gap-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || !signInLoaded}
              className="flex-1 px-4 py-1.5 rounded-full border bg-white transition-all text-center text-sm font-medium hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                borderColor: "var(--primary)",
                color: "var(--primary-dark)",
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

            {/* FD 모드일 때만 대기자 등록 버튼 표시 */}
            {siteMode === "faked_door" && (
              <button
                onClick={() => setShowWaitlistForm(true)}
                className="px-4 py-1.5 rounded-full border transition-all text-sm font-medium hover:shadow-md flex items-center justify-center gap-2"
                style={{
                  borderColor: "var(--primary)",
                  backgroundColor: "color-mix(in srgb, var(--primary) 15%, transparent)",
                  color: "var(--primary)",
                }}
              >
                <LuMail className="w-4 h-4" />
                대기자 등록
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <LuTriangleAlert className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {remaining !== null && remaining > 0 && (
          <p
            className="text-xs text-center mt-2 opacity-70"
            style={{ color: "var(--primary)" }}
          >
            선착순 300명 한정 • 남은 자리: {remaining}명
          </p>
        )}
      </div>
    </div>
  );
}
