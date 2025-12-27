"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { LuCloud, LuLoader, LuLogIn, LuLogOut, LuUser, LuX } from "react-icons/lu";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { SettingSection } from "./SettingSection";

type ConfirmModalType = "logout" | "switch" | null;

export function ProfileSection() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalType>(null);
  const {
    isConnected: isGoogleDriveConnected,
    isChecking: isCheckingDrive,
  } = useGoogleDriveStatus();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  if (!user) return null;

  const handleAccountSwitch = () => {
    setShowModal(true);
  };

  const handleClerkAccountSwitch = async () => {
    setShowModal(false);
    setConfirmModal("switch");
  };

  const confirmClerkAccountSwitch = async () => {
    setConfirmModal(null);
    setIsSwitching(true);
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Error switching account:", error);
      toast.error("계정 전환 중 오류가 발생했습니다");
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
          toast.success("기존 연동을 해제했습니다. 새 계정으로 연동합니다...");
          // 잠시 후 재연동 시작
          setTimeout(() => {
            window.location.href = "/api/auth/google";
          }, 500);
        } else {
          toast.error("연동 해제에 실패했습니다");
          setIsDisconnecting(false);
        }
      } catch (error) {
        console.error("Error disconnecting Google Drive:", error);
        toast.error("연동 해제 중 오류가 발생했습니다");
        setIsDisconnecting(false);
      }
    } else {
      // 바로 연동
      window.location.href = "/api/auth/google";
    }
  };

  const handleSignOut = () => {
    setConfirmModal("logout");
  };

  const confirmSignOut = async () => {
    setConfirmModal(null);
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("로그아웃 중 오류가 발생했습니다");
      setIsLoggingOut(false);
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
              {user.firstName?.[0] ||
                user.emailAddresses?.[0]?.emailAddress?.[0] ||
                "U"}
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
          <span>
            {isSwitching || isDisconnecting ? "전환 중..." : "계정 전환"}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-left w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <LuLoader size={14} className="text-neutral-400 animate-spin" />
          ) : (
            <LuLogOut size={14} className="text-neutral-400" />
          )}
          <span>{isLoggingOut ? "로그아웃 중..." : "로그아웃"}</span>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#060010] border border-neutral-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                style={{ boxShadow: "0 8px 32px rgba(124, 77, 212, 0.15)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">계정 전환</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <LuX size={18} className="text-neutral-400" />
                  </button>
                </div>
                <p className="text-sm text-neutral-400 mb-4">
                  전환할 계정 유형을 선택하세요
                </p>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClerkAccountSwitch}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-purple-500/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <LuLogIn size={18} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        로그인 계정 전환
                      </div>
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-purple-500/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <LuCloud size={18} className="text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        Google 계정 변경
                      </div>
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
                  className="mt-4 w-full px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors text-sm font-medium"
                >
                  취소
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 확인 모달 (로그아웃/계정전환) */}
      <AnimatePresence>
        {confirmModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-start justify-center p-4 pt-[20%] lg:pt-[15%]"
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-sm w-full"
                style={{
                  background: "rgba(6, 0, 16, 0.95)",
                  border: "1px solid rgba(124, 77, 212, 0.3)",
                  borderRadius: "16px",
                  padding: "12px 16px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 8px 32px rgba(124, 77, 212, 0.2)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    confirmModal === "logout" 
                      ? "bg-purple-500/20" 
                      : "bg-purple-500/20"
                  }`}>
                    {confirmModal === "logout" ? (
                      <LuLogOut size={16} className="text-purple-400" />
                    ) : (
                      <LuLogIn size={16} className="text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">
                      {confirmModal === "logout" ? "로그아웃" : "계정 전환"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {confirmModal === "logout" 
                        ? "정말 로그아웃하시겠습니까?" 
                        : "다른 계정으로 전환하시겠습니까?\n현재 세션에서 로그아웃됩니다."}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 transition-colors text-xs font-medium text-white"
                  >
                    취소
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmModal === "logout" ? confirmSignOut : confirmClerkAccountSwitch}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-700/80 text-white text-xs font-medium transition-colors"
                  >
                    확인
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
