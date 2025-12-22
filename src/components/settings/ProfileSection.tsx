"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LuUser, LuLogIn, LuCloud, LuLogOut } from "react-icons/lu";
import { motion, AnimatePresence } from "motion/react";
import { SettingSection } from "./SettingSection";
import { useState, useEffect } from "react";

export function ProfileSection() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
  }, []);

  if (!user) return null;

  const handleAccountSwitch = () => {
    setShowModal(true);
  };

  const handleClerkAccountSwitch = async () => {
    setShowModal(false);
    if (!confirm("다른 계정으로 전환하시겠습니까? 현재 세션에서 로그아웃됩니다.")) {
      return;
    }

    setIsSwitching(true);
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Error switching account:", error);
      alert("계정 전환 중 오류가 발생했습니다.");
      setIsSwitching(false);
    }
  };

  const handleGoogleAccountSwitch = async () => {
    setShowModal(false);
    
    if (isGoogleDriveConnected) {
      // 기존 연동 해제 후 재연동
      setIsDisconnecting(true);
      try {
        const response = await fetch("/api/auth/google/disconnect", {
          method: "POST",
        });

        if (response.ok) {
          setIsGoogleDriveConnected(false);
          // 잠시 후 재연동 시작
          setTimeout(() => {
            window.location.href = "/api/auth/google";
          }, 500);
        } else {
          alert("연동 해제에 실패했습니다.");
          setIsDisconnecting(false);
        }
      } catch (error) {
        console.error("Error disconnecting Google Drive:", error);
        alert("연동 해제 중 오류가 발생했습니다.");
        setIsDisconnecting(false);
      }
    } else {
      // 바로 연동
      window.location.href = "/api/auth/google";
    }
  };

  const handleSignOut = async () => {
    if (!confirm("로그아웃하시겠습니까?")) {
      return;
    }

    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <SettingSection
        title="프로필 설정"
        description="계정 정보를 확인하고 수정하세요"
        icon={<LuUser size={16} />}
        delay={0}
      >
        <div className="flex items-center gap-3 mb-3">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || "Profile"}
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-purple-500">
              {user.firstName?.[0] || user.emailAddresses?.[0]?.emailAddress?.[0] || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate">
              {user.fullName || "사용자"}
            </h3>
            <p className="text-xs text-neutral-400 truncate">
              {user.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAccountSwitch}
          disabled={isSwitching || isDisconnecting}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-left w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed mb-2"
        >
          <LuLogIn size={14} className="text-neutral-400" />
          <span>{isSwitching || isDisconnecting ? "전환 중..." : "계정 전환"}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-left w-full text-sm"
        >
          <LuLogOut size={14} className="text-neutral-400" />
          <span>로그아웃</span>
        </motion.button>
      </SettingSection>

      {/* 계정 전환 모달 */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#060010] border border-neutral-700 rounded-2xl p-6 max-w-md w-full"
              >
                <h3 className="text-lg font-semibold mb-2">계정 전환</h3>
                <p className="text-sm text-neutral-400 mb-4">
                  전환할 계정 유형을 선택하세요
                </p>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClerkAccountSwitch}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors text-left"
                  >
                    <LuLogIn size={20} className="text-neutral-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">로그인 계정 전환</div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        다른 계정으로 로그인합니다
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleAccountSwitch}
                    disabled={isCheckingDrive}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LuCloud size={20} className="text-neutral-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">Google 계정 변경</div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {isGoogleDriveConnected
                          ? "연결된 Google 계정을 변경합니다"
                          : "Google 계정을 연결합니다"}
                      </div>
                    </div>
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(false)}
                  className="mt-4 w-full px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors text-sm"
                >
                  취소
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
