"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LuLayoutDashboard, LuLogOut, LuX } from "react-icons/lu";

interface ProfileMenuProps {
  isAdmin: boolean;
  size?: "small" | "large";
}

export function ProfileMenu({ isAdmin, size = "large" }: ProfileMenuProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
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
    signOut();
  };

  const handleBackClick = () => {
    setIsExpanded(false);
  };

  return (
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
  );
}
