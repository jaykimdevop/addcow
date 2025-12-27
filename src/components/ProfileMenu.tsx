"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuLoader, LuLogOut } from "react-icons/lu";
import { VscAccount, VscSettings, VscSignOut } from "react-icons/vsc";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDockSettingsClick: () => void;
}

export function ProfileMenu({
  isOpen,
  onClose,
  onDockSettingsClick,
}: ProfileMenuProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOutClick = () => {
    onClose();
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[100] pointer-events-auto"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 w-64 bg-[#060010] border border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-[101] pointer-events-auto"
            >
              <div className="p-4 border-b border-neutral-700">
                <div className="flex items-center gap-3">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || "Profile"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {user?.firstName?.[0] ||
                        user?.emailAddresses?.[0]?.emailAddress?.[0] ||
                        "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {user?.fullName || "사용자"}
                    </p>
                    <p className="text-neutral-400 text-xs truncate">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    onClose();
                    onDockSettingsClick();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors text-left"
                >
                  <VscSettings size={18} className="text-neutral-400" />
                  <span className="text-white text-sm">Dock 설정</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    router.push("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors text-left"
                >
                  <VscAccount size={18} className="text-neutral-400" />
                  <span className="text-white text-sm">설정</span>
                </button>

                <button
                  onClick={handleSignOutClick}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-900/30 transition-colors text-left"
                >
                  <VscSignOut size={18} className="text-red-400" />
                  <span className="text-red-400 text-sm">로그아웃</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 로그아웃 확인 모달 */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-start justify-center p-4 pt-[20%] lg:pt-[15%]"
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
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <LuLogOut size={16} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">로그아웃</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      정말 로그아웃하시겠습니까?
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutConfirm(false)}
                    disabled={isLoggingOut}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 transition-colors text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmSignOut}
                    disabled={isLoggingOut}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-700/80 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <>
                        <LuLoader size={12} className="animate-spin" />
                        로그아웃 중...
                      </>
                    ) : (
                      "확인"
                    )}
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
