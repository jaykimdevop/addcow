"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LuLoader,
  LuToggleLeft,
  LuToggleRight,
  LuTriangleAlert,
} from "react-icons/lu";
import type { SiteMode } from "@/lib/site-settings";

interface SiteModeToggleProps {
  currentMode: SiteMode;
}

export function SiteModeToggle({ currentMode }: SiteModeToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleModeChange = async (newMode: SiteMode) => {
    if (newMode === currentMode) return;

    if (newMode === "mvp" && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update site mode");
      }

      // If transitioning to MVP, trigger notifications and account creation
      if (newMode === "mvp") {
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
      setShowConfirm(false);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to update site mode",
      );
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Mode Display */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">
              현재 사이트 모드
            </h2>
            <p className="text-xs text-neutral-400">
              {currentMode === "faked_door"
                ? "이메일 수집 모드: 이메일 수집 페이지가 표시됩니다"
                : "MVP 모드: 제품 페이지가 표시됩니다"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {currentMode === "faked_door" ? (
              <LuToggleLeft className="w-10 h-10 text-neutral-400" />
            ) : (
              <LuToggleRight className="w-10 h-10 text-purple-400" />
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleModeChange("faked_door")}
            disabled={isLoading || currentMode === "faked_door"}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              currentMode === "faked_door"
                ? "bg-purple-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            이메일 수집
          </button>

          <button
            onClick={() => handleModeChange("mvp")}
            disabled={isLoading || currentMode === "mvp"}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              currentMode === "mvp"
                ? "bg-purple-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            MVP
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-700">
          <div className="flex items-start gap-4 mb-4">
            <LuTriangleAlert className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-yellow-100 mb-1">
                MVP로 전환하시겠습니까?
              </h3>
              <p className="text-xs text-yellow-200 mb-3">
                MVP로 전환하면:
              </p>
              <ul className="list-disc list-inside text-xs text-yellow-200 space-y-1 mb-3">
                <li>홈페이지가 MVP 페이지로 변경됩니다</li>
                <li>대기자 명단에 이메일 알림이 발송됩니다</li>
                <li>대기자 계정이 자동으로 생성됩니다</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange("mvp")}
              disabled={isLoading || isTransitioning}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
            >
              {(isLoading || isTransitioning) && (
                <LuLoader className="w-4 h-4 animate-spin" />
              )}
              확인 및 전환
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isLoading || isTransitioning}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 font-medium hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Transition Status */}
      {isTransitioning && (
        <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700">
          <div className="flex items-center gap-3">
            <LuLoader className="w-5 h-5 animate-spin text-blue-400" />
            <p className="text-xs text-blue-200">
              MVP 전환 중... 이메일 발송 및 계정 생성을 진행하고 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
