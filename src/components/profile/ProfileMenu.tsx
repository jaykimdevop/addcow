"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LuLayoutDashboard, LuLoader, LuLogOut, LuX } from "react-icons/lu";

interface ProfileMenuProps {
  isAdmin: boolean;
  size?: "small" | "large";
}

export function ProfileMenu({ isAdmin, size = "large" }: ProfileMenuProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 크기 설정
  const sizeConfig =
    size === "small"
      ? { dimension: 32, imageSize: 32, fontSize: "text-xs" }
      : { dimension: 72, imageSize: 72, fontSize: "text-xl" };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  if (!user) return null;

  const handleDashboardClick = () => {
    setIsExpanded(false);
    router.push("/admin");
  };

  const handleLogoutClick = () => {
    setIsExpanded(false);
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

  const handleBackClick = () => {
    setIsExpanded(false);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* 메인 프로필 버튼 */}
        <div className="relative group">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`rounded-full overflow-hidden flex items-center justify-center transition-all border-2 cursor-pointer ${sizeConfig.fontSize}`}
            style={{
              width: `${sizeConfig.dimension}px`,
              height: `${sizeConfig.dimension}px`,
              borderColor: "var(--primary)",
            }}
          >
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.fullName || "Profile"}
                width={sizeConfig.imageSize}
                height={sizeConfig.imageSize}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-white font-medium ${sizeConfig.fontSize}`}
                style={{ backgroundColor: "var(--primary)" }}
              >
                {user.firstName?.charAt(0) ||
                  user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
          {/* 툴팁 - 설정하기 */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            설정하기
          </div>
        </div>

        {/* 확장된 버튼들 */}
        {isExpanded && (
          <div className="absolute top-0 left-0 flex gap-2">
            {/* 뒤로가기 버튼 */}
            <div className="relative group">
              <button
                onClick={handleBackClick}
                className={`rounded-full flex items-center justify-center border-2 cursor-pointer bg-white transition-all hover:scale-110 profile-menu-slide-in`}
                style={{
                  width: `${sizeConfig.dimension}px`,
                  height: `${sizeConfig.dimension}px`,
                  borderColor: "var(--primary)",
                }}
              >
                <LuX className="w-4 h-4" style={{ color: "var(--primary)" }} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                뒤로가기
              </div>
            </div>

            {/* 대시보드 버튼 (관리자만) */}
            {isAdmin && (
              <div className="relative group">
                <button
                  onClick={handleDashboardClick}
                  className={`rounded-full flex items-center justify-center border-2 cursor-pointer bg-white transition-all hover:scale-110 profile-menu-slide-in-delay-1`}
                  style={{
                    width: `${sizeConfig.dimension}px`,
                    height: `${sizeConfig.dimension}px`,
                    borderColor: "var(--primary)",
                  }}
                >
                  <LuLayoutDashboard
                    className="w-4 h-4"
                    style={{ color: "var(--primary)" }}
                  />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  대시보드로 이동
                </div>
              </div>
            )}

            {/* 로그아웃 버튼 */}
            <div className="relative group">
              <button
                onClick={handleLogoutClick}
                className={`rounded-full flex items-center justify-center border-2 cursor-pointer bg-white transition-all hover:scale-110 ${isAdmin ? "profile-menu-slide-in-delay-2" : "profile-menu-slide-in-delay-1"}`}
                style={{
                  width: `${sizeConfig.dimension}px`,
                  height: `${sizeConfig.dimension}px`,
                  borderColor: "var(--primary)",
                }}
              >
                <LuLogOut
                  className="w-4 h-4"
                  style={{ color: "var(--primary)" }}
                />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                로그아웃
              </div>
            </div>
          </div>
        )}
      </div>

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
