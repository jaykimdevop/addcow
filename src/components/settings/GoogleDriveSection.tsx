"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuCloud, LuCheck, LuX, LuLoader } from "react-icons/lu";
import { motion } from "motion/react";
import { SettingSection } from "./SettingSection";

interface GoogleDriveSectionProps {
  delay?: number;
}

export function GoogleDriveSection({ delay = 0.1 }: GoogleDriveSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [isCheckingDrive, setIsCheckingDrive] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Google Drive 연동 상태 확인
  useEffect(() => {
    const checkGoogleDriveStatus = async () => {
      try {
        const response = await fetch("/api/drive/status");
        const data = await response.json();
        setIsGoogleDriveConnected(data.connected || false);
      } catch (error) {
        console.error("Error checking Google Drive status:", error);
        setIsGoogleDriveConnected(false);
      } finally {
        setIsCheckingDrive(false);
      }
    };

    checkGoogleDriveStatus();

    // URL 파라미터에서 연결 성공/실패 확인
    const connected = searchParams?.get("connected");
    const error = searchParams?.get("error");
    if (connected === "true") {
      setIsGoogleDriveConnected(true);
      router.replace("/settings");
    } else if (error) {
      console.error("Google Drive connection error:", error);
      router.replace("/settings");
    }
  }, [searchParams, router]);

  const handleConnectGoogleDrive = () => {
    window.location.href = "/api/auth/google";
  };

  const handleDisconnectGoogleDrive = async () => {
    if (!confirm("Google Drive 연동을 해제하시겠습니까?")) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/auth/google/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        setIsGoogleDriveConnected(false);
      } else {
        alert("연동 해제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error disconnecting Google Drive:", error);
      alert("연동 해제 중 오류가 발생했습니다.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <SettingSection
      title="저장소 연동"
      description="Google Drive를 연동하여 파일을 관리하세요"
      icon={<LuCloud size={16} />}
      delay={delay}
    >
      {isCheckingDrive ? (
        <div className="flex items-center justify-center py-6">
          <LuLoader className="animate-spin text-neutral-400" size={16} />
          <span className="ml-2 text-xs text-neutral-400">연동 상태 확인 중...</span>
        </div>
      ) : isGoogleDriveConnected ? (
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800 rounded-lg"
          >
            <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <LuCheck className="text-white" size={10} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white">연동됨</div>
              <div className="text-xs text-neutral-400 mt-0.5">
                Google Drive가 성공적으로 연동되었습니다
              </div>
            </div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDisconnectGoogleDrive}
            disabled={isDisconnecting}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors text-white w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <LuX size={14} />
            <span>{isDisconnecting ? "연동 해제 중..." : "연동 해제"}</span>
          </motion.button>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConnectGoogleDrive}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors text-white w-full text-sm"
        >
          <LuCloud size={14} />
          <span>Google Drive 연동</span>
        </motion.button>
      )}
    </SettingSection>
  );
}
