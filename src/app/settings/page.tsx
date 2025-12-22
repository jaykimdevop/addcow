"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { DockSettingsSection } from "@/components/settings/DockSettingsSection";
import { GoogleDriveSection } from "@/components/settings/GoogleDriveSection";
import { CommunicationSettingsSection } from "@/components/settings/CommunicationSettingsSection";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060010]">
        <div className="text-white text-sm">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#060010] text-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            mass: 0.5,
            stiffness: 200,
            damping: 20,
          }}
          className="mb-6"
        >
          <h1 className="text-xl font-bold">설정</h1>
          <p className="text-xs text-neutral-400 mt-1">
            계정 및 Dock 설정을 관리하세요
          </p>
        </motion.div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-min">
          <ProfileSection />
          <DockSettingsSection delay={0.05} />
          <GoogleDriveSection delay={0.1} />
          <CommunicationSettingsSection delay={0.15} />
        </div>
      </div>
    </div>
  );
}
