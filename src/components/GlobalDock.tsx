"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LuDownload,
  LuFileText,
  LuLayoutDashboard,
  LuSettings,
  LuUsers,
} from "react-icons/lu";
import {
  VscCloudUpload,
  VscFiles,
  VscGitCommit,
  VscHome,
  VscShield,
} from "react-icons/vsc";
import { AnimatePresence, motion } from "motion/react";
import Dock from "@/components/Dock";

interface GlobalDockProps {
  initialIsAdmin?: boolean;
  initialRole?: "admin" | "viewer" | null;
}

export function GlobalDock({ initialIsAdmin = false, initialRole = null }: GlobalDockProps = {}) {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin] = useState(initialIsAdmin);
  const [adminRole] = useState<"admin" | "viewer" | null>(initialRole);

  // Local Dock 숨김 상태
  const [hiddenLocalDocks, setHiddenLocalDocks] = useState<Set<string>>(
    new Set(),
  );

  // Dock settings state (localStorage에서 불러오기)
  const [panelHeight, setPanelHeight] = useState(68);
  const [baseItemSize, setBaseItemSize] = useState(50);
  const [magnification, setMagnification] = useState(70);
  const [backgroundColor, setBackgroundColor] = useState("#060010");
  const [backgroundOpacity, setBackgroundOpacity] = useState(100);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 체크
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // localStorage에서 Dock 설정 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPanelHeight = localStorage.getItem("dock_panelHeight");
      const savedBaseItemSize = localStorage.getItem("dock_baseItemSize");
      const savedMagnification = localStorage.getItem("dock_magnification");
      const savedBackgroundColor = localStorage.getItem("dock_backgroundColor");
      const savedBackgroundOpacity = localStorage.getItem("dock_backgroundOpacity");

      if (savedPanelHeight) setPanelHeight(Number(savedPanelHeight));
      if (savedBaseItemSize) setBaseItemSize(Number(savedBaseItemSize));
      if (savedMagnification) setMagnification(Number(savedMagnification));
      if (savedBackgroundColor) setBackgroundColor(savedBackgroundColor);
      if (savedBackgroundOpacity) setBackgroundOpacity(Number(savedBackgroundOpacity));
    }
  }, []);

  // Dock 설정 변경 이벤트 구독 (실시간 반영)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleDockSettingsChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        panelHeight: number;
        baseItemSize: number;
        magnification: number;
        backgroundColor?: string;
        backgroundOpacity?: number;
      }>;
      if (customEvent.detail) {
        setPanelHeight(customEvent.detail.panelHeight);
        setBaseItemSize(customEvent.detail.baseItemSize);
        setMagnification(customEvent.detail.magnification);
        if (customEvent.detail.backgroundColor) {
          setBackgroundColor(customEvent.detail.backgroundColor);
        }
        if (customEvent.detail.backgroundOpacity !== undefined) {
          setBackgroundOpacity(customEvent.detail.backgroundOpacity);
        }
      }
    };

    window.addEventListener("dockSettingsChange", handleDockSettingsChange);

    return () => {
      window.removeEventListener(
        "dockSettingsChange",
        handleDockSettingsChange,
      );
    };
  }, []);

  // Dock 설정 변경 시 localStorage에 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dock_panelHeight", panelHeight.toString());
      localStorage.setItem("dock_baseItemSize", baseItemSize.toString());
      localStorage.setItem("dock_magnification", magnification.toString());
    }
  }, [panelHeight, baseItemSize, magnification]);

  // 관리자 권한은 서버에서 확인하여 props로 전달받음 (성능 최적화)

  // 로그인하지 않았거나 로딩 중이면 Dock 표시 안 함
  if (!isLoaded || !isSignedIn || !user) {
    return null;
  }

  // 특정 페이지에서는 Dock을 숨길 수 있음 (예: 로그인/회원가입 페이지)
  const hideDockPaths = ["/sign-in", "/sign-up"];
  if (hideDockPaths.some((path) => pathname?.startsWith(path))) {
    return null;
  }

  // 각 Dock 아이템의 경로 매핑
  const baseDockItems = [
    {
      icon: <VscHome size={18} className="text-white" />,
      label: "홈",
      path: "/home",
      onClick: () => router.push("/home"),
    },
    {
      icon: <VscGitCommit size={18} className="text-white" />,
      label: "노드",
      path: "/node",
      onClick: () => router.push("/node"),
    },
    {
      icon: <VscFiles size={18} className="text-white" />,
      label: "작업물",
      path: "/asset",
      onClick: () => router.push("/asset"),
    },
    {
      icon: <VscCloudUpload size={18} className="text-white" />,
      label: "업로드",
      path: "/knowledge",
      onClick: () => router.push("/knowledge"),
    },
  ];

  // Local Dock 토글 함수
  const toggleLocalDock = (dockId: string) => {
    setHiddenLocalDocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dockId)) {
        newSet.delete(dockId);
      } else {
        newSet.add(dockId);
      }
      return newSet;
    });
  };

  // 관리자인 경우 관리자 버튼 추가
  const isAdminPage = pathname?.startsWith("/admin");
  const adminItem = isAdmin
    ? {
        icon: <VscShield size={18} className="text-white" />,
        label: "관리자",
        path: "/admin",
        onClick: () => {
          if (isAdminPage) {
            // 이미 admin 페이지에 있으면 Local Dock 토글
            toggleLocalDock("admin");
          } else {
            // admin 페이지로 이동하고 숨김 상태 해제
            setHiddenLocalDocks((prev) => {
              const newSet = new Set(prev);
              newSet.delete("admin");
              return newSet;
            });
            router.push("/admin");
          }
        },
      }
    : null;

  const settingsItem = {
    icon: user?.imageUrl ? (
      <img
        src={user.imageUrl}
        alt={user.fullName || "Profile"}
        className="w-full h-full object-cover rounded-full pointer-events-none"
      />
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold rounded-full pointer-events-none">
        <span className="text-[14px]">
          {user?.firstName?.[0] ||
            user?.emailAddresses?.[0]?.emailAddress?.[0] ||
            "U"}
        </span>
      </div>
    ),
    label: "설정",
    path: "/settings",
    onClick: () => router.push("/settings"),
  };

  // 최종 Dock 아이템 배열 (settings 버튼 다음에 admin 버튼 배치)
  const dockItems = adminItem
    ? [...baseDockItems, settingsItem, adminItem]
    : [...baseDockItems, settingsItem];

  // 현재 경로와 일치하는 아이템 찾기
  const isActive = (path: string) => {
    if (!pathname) return false;
    // 정확히 일치하거나 하위 경로인 경우
    return pathname === path || pathname.startsWith(path + "/");
  };

  // Local Dock용 활성화 체크 (루트 경로는 정확히 일치할 때만)
  const isLocalDockActive = (href: string, rootPath: string) => {
    if (!pathname) return false;
    if (href === rootPath) {
      return pathname === rootPath;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // ============================================================
  // Local Dock 정의
  // ============================================================

  // Local Dock - Admin
  const localDockAdmin =
    isAdminPage && adminRole && !hiddenLocalDocks.has("admin")
      ? [
          { href: "/admin", label: "대시보드", icon: LuLayoutDashboard },
          { href: "/admin/users?tab=submissions", label: "사용자 관리", icon: LuFileText },
          ...(adminRole === "admin"
            ? [
                { href: "/admin/settings", label: "시스템 관리", icon: LuSettings },
              ]
            : []),
        ]
      : [];

  // 현재 활성화된 Local Dock 결정
  const activeLocalDock = localDockAdmin.length > 0 ? "admin" : null;
  const localDockItems = localDockAdmin;
  const localDockRootPath = "/admin";

  // 모바일에서는 고정값 사용
  const finalPanelHeight = isMobile ? 70 : panelHeight;
  const finalBaseItemSize = isMobile ? 50 : baseItemSize;
  const finalMagnification = isMobile ? finalBaseItemSize : magnification; // 모바일에서는 magnification 비활성화

  // Background color with opacity
  const backgroundRgb = hexToRgb(backgroundColor);
  const backgroundWithOpacity = backgroundRgb
    ? `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, ${backgroundOpacity / 100})`
    : backgroundColor;

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 flex flex-col-reverse lg:flex-row items-center lg:items-end gap-2 pointer-events-none z-50">
      <Dock
        items={dockItems.map((item) => ({
          ...item,
          isActive: isActive(item.path),
        }))}
        panelHeight={finalPanelHeight}
        baseItemSize={finalBaseItemSize}
        magnification={finalMagnification}
        backgroundColor={backgroundWithOpacity}
        isMobile={isMobile}
      />
      {/* Local Dock */}
      <AnimatePresence mode="popLayout">
        {activeLocalDock && localDockItems.length > 0 && (
          <motion.div
            key={activeLocalDock}
            layout
            initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              mass: 0.8,
            }}
          >
            <Dock
              items={localDockItems.map((item) => {
                const Icon = item.icon;
                return {
                  icon: <Icon size={18} className="text-white" />,
                  label: item.label,
                  onClick: () => router.push(item.href),
                  isActive: isLocalDockActive(item.href, localDockRootPath),
                };
              })}
              panelHeight={finalPanelHeight}
              baseItemSize={finalBaseItemSize}
              magnification={finalMagnification}
              backgroundColor={backgroundWithOpacity}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hex to RGB helper function
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
