"use client";

import { useState, useEffect } from "react";
import { LuMail, LuCheck, LuLoader } from "react-icons/lu";
import { event } from "@/lib/analytics";

export function EmailCollector() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  // 이메일 유효성 검사
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 남은 인원 가져오기
  const fetchRemaining = async () => {
    try {
      const response = await fetch("/api/waitlist/count");
      const data = await response.json();
      setRemaining(data.remaining);
    } catch (error) {
      console.error("Failed to fetch remaining count:", error);
    }
  };

  // 컴포넌트 마운트 시 남은 인원 가져오기
  useEffect(() => {
    fetchRemaining();
    // 1분마다 업데이트
    const interval = setInterval(fetchRemaining, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "문제가 발생했습니다");
      }

      setIsSuccess(true);
      setEmail("");

      // 남은 인원 업데이트
      fetchRemaining();

      // Track event
      event({
        action: "email_submitted",
        category: "engagement",
        label: "waitlist_signup",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "이메일 제출에 실패했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)', borderColor: 'var(--primary)', borderWidth: '1px' }}>
        <LuCheck className="w-12 h-12" style={{ color: 'var(--primary)' }} />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>
            감사합니다!
          </h3>
          <p style={{ color: 'var(--primary)' }}>
            출시 시 알려드리겠습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isFocused || email ? "" : "이메일을 입력하세요"}
            required
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 px-4 py-1.5 rounded-full border bg-white placeholder:text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all text-center text-base font-bold"
            style={{
              borderColor: 'var(--primary)',
              color: 'var(--primary-dark)',
              '--tw-ring-color': 'var(--primary)'
            } as React.CSSProperties}
            disabled={isLoading}
          />
          {isValidEmail(email) && (
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-1.5 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm font-bold whitespace-nowrap"
              style={{
                backgroundColor: 'var(--primary-dark)',
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
            >
              {isLoading ? (
                <LuLoader className="w-4 h-4 animate-spin" />
              ) : (
                "등록"
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        )}
        {remaining !== null && remaining > 0 && (
          <p className="text-xs text-center mt-2 opacity-70" style={{ color: 'var(--primary)' }}>
            선착순 300명 한정 • 남은 자리: {remaining}명
          </p>
        )}
      </div>
    </form>
  );
}

