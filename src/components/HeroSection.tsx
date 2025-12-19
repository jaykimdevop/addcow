"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { EmailCollector } from "@/components/EmailCollector";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { LuSparkles, LuFolderPlus } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { VscHome, VscGitCommit, VscFiles, VscCloudUpload } from "react-icons/vsc";
import { FadeIn, SplitText } from "@/components/react-bits";
import Dock from "@/components/Dock";
import { ProfileMenu as UserProfileMenu } from "@/components/ProfileMenu";
import { DockSettings } from "@/components/DockSettings";

interface HeroSectionProps {
  isAdmin: boolean;
  showContent?: boolean;
}

export function HeroSection({ isAdmin, showContent = true }: HeroSectionProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();

  // Dock settings state
  const [panelHeight, setPanelHeight] = useState(68);
  const [baseItemSize, setBaseItemSize] = useState(50);
  const [magnification, setMagnification] = useState(70);
  const [showDockSettings, setShowDockSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="relative z-10 pointer-events-none h-full flex flex-col items-center justify-center -mt-4">
      {/* 로그인하지 않은 사용자 화면 */}
      {isLoaded && !isSignedIn && showContent && (
        <>
          <div className="text-center">
            <FadeIn delay={0.1} duration={0.6}>
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="pointer-events-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                    <LuSparkles className="w-3.5 h-3.5" />
                    ADDCOW RAG BETA
                  </div>
                </div>
              </div>
            </FadeIn>
            <h1 className="text-xl md:text-2xl text-gray-900 dark:text-gray-100 mb-2 leading-relaxed min-h-[120px] flex flex-col justify-center">
              <SplitText
                text="24시간 전문가 지식베이스로 수행되는"
                delay={0.2}
                duration={0.5}
                className="block font-light"
              />
              <span className="text-white dark:text-white block">
                <SplitText
                  text="지식기반 자동화 마케팅을 경험해보세요"
                  delay={0.5}
                  duration={0.5}
                  className="font-medium"
                />
              </span>
            </h1>
          </div>

          <div className="mt-4 min-h-[80px] flex items-start justify-center">
            <FadeIn delay={0.8} duration={0.6}>
              <div className="pointer-events-auto">
                <EmailCollector />
              </div>
            </FadeIn>
          </div>
        </>
      )}

      {/* 로그인한 사용자 화면 */}
      {isLoaded && isSignedIn && user && (
        <>
          <FadeIn delay={1.6} duration={0.8}>
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
              <Dock
                items={[
                  {
                    icon: <VscHome size={18} />,
                    label: '홈',
                    onClick: () => router.push('/home')
                  },
                  {
                    icon: <VscGitCommit size={18} />,
                    label: '노드',
                    onClick: () => router.push('/node')
                  },
                  {
                    icon: <VscFiles size={18} />,
                    label: '작업물',
                    onClick: () => router.push('/asset')
                  },
                  {
                    icon: <VscCloudUpload size={18} />,
                    label: '업로드',
                    onClick: () => router.push('/knowledge')
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
                          {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || "U"}
                        </span>
                      </div>
                    ),
                    label: '프로필',
                    onClick: () => router.push('/profile'),
                    className: 'overflow-hidden'
                  },
                ]}
                panelHeight={panelHeight}
                baseItemSize={baseItemSize}
                magnification={magnification}
              />
            </div>
          </FadeIn>

          <UserProfileMenu
            isOpen={showProfileMenu}
            onClose={() => setShowProfileMenu(false)}
            onDockSettingsClick={() => {
              setShowProfileMenu(false);
              setShowDockSettings(true);
            }}
          />

          <DockSettings
            isOpen={showDockSettings}
            onClose={() => setShowDockSettings(false)}
            panelHeight={panelHeight}
            baseItemSize={baseItemSize}
            magnification={magnification}
            onPanelHeightChange={setPanelHeight}
            onBaseItemSizeChange={setBaseItemSize}
            onMagnificationChange={setMagnification}
          />
        </>
      )}
    </div>
  );
}
