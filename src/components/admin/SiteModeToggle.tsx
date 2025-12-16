"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuToggleLeft, LuToggleRight, LuLoader, LuTriangleAlert } from "react-icons/lu";
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
        fetch("/api/admin/notify-waitlist", { method: "POST" }).catch(
          (err) => console.error("Failed to notify waitlist:", err)
        );

        // Trigger account creation (async)
        fetch("/api/admin/create-accounts", { method: "POST" }).catch(
          (err) => console.error("Failed to create accounts:", err)
        );
      }

      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to update site mode"
      );
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Mode Display */}
      <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              현재 사이트 모드
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentMode === "faked_door"
                ? "Faked Door 모드: 이메일 수집 페이지가 표시됩니다"
                : "MVP 모드: 제품 페이지가 표시됩니다"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {currentMode === "faked_door" ? (
              <LuToggleLeft className="w-12 h-12 text-gray-400" />
            ) : (
              <LuToggleRight className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleModeChange("faked_door")}
            disabled={isLoading || currentMode === "faked_door"}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentMode === "faked_door"
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Faked Door
          </button>

          <button
            onClick={() => handleModeChange("mvp")}
            disabled={isLoading || currentMode === "mvp"}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentMode === "mvp"
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            MVP
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="p-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-4 mb-4">
            <LuTriangleAlert className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                MVP로 전환하시겠습니까?
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                MVP로 전환하면:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1 mb-4">
                <li>홈페이지가 MVP 페이지로 변경됩니다</li>
                <li>대기자 명단에 이메일 알림이 발송됩니다</li>
                <li>대기자 계정이 자동으로 생성됩니다</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleModeChange("mvp")}
              disabled={isLoading || isTransitioning}
              className="px-6 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {(isLoading || isTransitioning) && (
                <LuLoader className="w-4 h-4 animate-spin" />
              )}
              확인 및 전환
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isLoading || isTransitioning}
              className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Transition Status */}
      {isTransitioning && (
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <LuLoader className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              MVP 전환 중... 이메일 발송 및 계정 생성을 진행하고 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

