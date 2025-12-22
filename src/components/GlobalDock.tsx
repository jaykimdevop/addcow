"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { VscHome, VscGitCommit, VscFiles, VscCloudUpload } from "react-icons/vsc";
import Dock from "@/components/Dock";

export function GlobalDock() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Dock settings state (localStorage에서 불러오기)
  const [panelHeight, setPanelHeight] = useState(68);
  const [baseItemSize, setBaseItemSize] = useState(50);
  const [magnification, setMagnification] = useState(70);

  // localStorage에서 Dock 설정 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPanelHeight = localStorage.getItem("dock_panelHeight");
      const savedBaseItemSize = localStorage.getItem("dock_baseItemSize");
      const savedMagnification = localStorage.getItem("dock_magnification");

      if (savedPanelHeight) setPanelHeight(Number(savedPanelHeight));
      if (savedBaseItemSize) setBaseItemSize(Number(savedBaseItemSize));
      if (savedMagnification) setMagnification(Number(savedMagnification));
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
      }>;
      if (customEvent.detail) {
        setPanelHeight(customEvent.detail.panelHeight);
        setBaseItemSize(customEvent.detail.baseItemSize);
        setMagnification(customEvent.detail.magnification);
      }
    };

    window.addEventListener("dockSettingsChange", handleDockSettingsChange);

    return () => {
      window.removeEventListener("dockSettingsChange", handleDockSettingsChange);
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
  const dockItems = [
    {
      icon: <VscHome size={18} />,
      label: "홈",
      path: "/home",
      onClick: () => router.push("/home"),
    },
    {
      icon: <VscGitCommit size={18} />,
      label: "노드",
      path: "/node",
      onClick: () => router.push("/node"),
    },
    {
      icon: <VscFiles size={18} />,
      label: "작업물",
      path: "/asset",
      onClick: () => router.push("/asset"),
    },
    {
      icon: <VscCloudUpload size={18} />,
      label: "업로드",
      path: "/knowledge",
      onClick: () => router.push("/knowledge"),
    },
    {
      icon: user?.imageUrl ? (
        <img
          src={user.imageUrl}
          alt={user.fullName || "Profile"}
          className="absolute inset-0 w-full h-full object-cover rounded-full pointer-events-none p-[2px]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold rounded-full pointer-events-none m-[2px]">
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
      className: "overflow-hidden",
    },
  ];

  // 현재 경로와 일치하는 아이템 찾기
  const isActive = (path: string) => {
    if (!pathname) return false;
    // 정확히 일치하거나 하위 경로인 경우
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <Dock
        items={dockItems.map((item) => ({
          ...item,
          isActive: isActive(item.path),
        }))}
        panelHeight={panelHeight}
        baseItemSize={baseItemSize}
        magnification={magnification}
      />
    </div>
  );
}
