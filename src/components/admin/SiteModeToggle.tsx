"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LuLoader,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu";
import type { SiteMode } from "@/lib/site-settings";

interface SiteModeToggleProps {
  currentMode: SiteMode;
}

export function SiteModeToggle({ currentMode }: SiteModeToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<SiteMode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleModeButtonClick = (newMode: SiteMode) => {
    if (newMode === currentMode) return;
    setPendingMode(newMode);
    setShowConfirm(true);
  };

  const handleConfirmChange = async () => {
    if (!pendingMode) return;

    setIsLoading(true);
    setShowConfirm(false);
    
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: pendingMode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update site mode");
      }

      // If transitioning to MVP, trigger notifications and account creation
      if (pendingMode === "mvp") {
        setIsTransitioning(true);

        // Trigger notifications (async)
        fetch("/api/admin/notify-waitlist", { method: "POST" }).catch((err) =>
          console.error("Failed to notify waitlist:", err),
        );

        // Trigger account creation (async)
        fetch("/api/admin/create-accounts", { method: "POST" }).catch((err) =>
          console.error("Failed to create accounts:", err),
        );
      }

      router.refresh();
      setPendingMode(null);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to update site mode",
      );
      setPendingMode(null);
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
    }
  };

  const handleCancelChange = () => {
    setShowConfirm(false);
    setPendingMode(null);
  };

  return (
    <div className="space-y-3">
      {/* Current Mode Display */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white mb-0.5">
            사이트 모드
          </h3>
          <p className="text-xs text-neutral-400">
            {currentMode === "faked_door"
              ? "FD 모드: 테스트 모드입니다"
              : "MVP 모드: 실제 서비스 모드입니다"}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleModeButtonClick("faked_door")}
            disabled={isLoading || isTransitioning}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
              currentMode === "faked_door"
                ? "bg-purple-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            FD 모드
          </button>

          <button
            onClick={() => handleModeButtonClick("mvp")}
            disabled={isLoading || isTransitioning}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
              currentMode === "mvp"
                ? "bg-purple-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            MVP 모드
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && pendingMode && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelChange}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] pointer-events-auto"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-32 -translate-x-1/2 w-full max-w-sm bg-[#060010] border border-neutral-700 rounded-lg shadow-2xl z-[101] pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-neutral-700">
                <h2 className="text-sm font-semibold text-white">
                  사이트 모드 전환
                </h2>
                <button
                  onClick={handleCancelChange}
                  className="p-1 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <LuX className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <LuTriangleAlert className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-100 mb-1">
                      {pendingMode === "mvp" ? "MVP 모드로 전환하시겠습니까?" : "FD 모드로 전환하시겠습니까?"}
                    </h3>
                    {pendingMode === "mvp" ? (
                      <>
                        <p className="text-xs text-yellow-200 mb-2">
                          MVP 모드로 전환하면:
                        </p>
                        <ul className="list-disc list-inside text-xs text-yellow-200 space-y-0.5 mb-2">
                          <li>홈페이지가 MVP 페이지로 변경됩니다</li>
                          <li>로그인 및 회원가입이 가능합니다</li>
                          <li>대기자 명단에 이메일 알림이 발송됩니다</li>
                          <li>대기자 계정이 자동으로 생성됩니다</li>
                        </ul>
                      </>
                    ) : (
                      <p className="text-xs text-yellow-200 mb-2">
                        FD 모드로 전환하면 홈페이지가 이메일 수집 페이지로 변경되고, 대기자 등록만 가능합니다.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 p-3 border-t border-neutral-700">
                <button
                  onClick={handleCancelChange}
                  disabled={isLoading || isTransitioning}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 font-medium hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmChange}
                  disabled={isLoading || isTransitioning}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 text-xs"
                >
                  {(isLoading || isTransitioning) && (
                    <LuLoader className="w-3.5 h-3.5 animate-spin" />
                  )}
                  확인
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Transition Status */}
      {isTransitioning && (
        <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700">
          <div className="flex items-center gap-2">
            <LuLoader className="w-4 h-4 animate-spin text-blue-400" />
            <p className="text-xs text-blue-200">
              MVP 전환 중... 이메일 발송 및 계정 생성을 진행하고 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
