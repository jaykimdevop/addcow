"use client";

import { motion, AnimatePresence } from "motion/react";
import { VscAccount, VscSignOut, VscSettings } from "react-icons/vsc";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDockSettingsClick: () => void;
}

export function ProfileMenu({ isOpen, onClose, onDockSettingsClick }: ProfileMenuProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
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
                    {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || "U"}
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
                <span className="text-white text-sm">프로필 설정</span>
              </button>

              <button
                onClick={handleSignOut}
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
  );
}
