"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { GoogleDriveFiles } from "@/components/upload/GoogleDriveFiles";
import { FileUpload } from "@/components/upload/FileUpload";
import { LuCloud, LuUpload } from "react-icons/lu";

export default function UploadPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [isCheckingDrive, setIsCheckingDrive] = useState(true);

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

    if (isLoaded && user) {
      checkGoogleDriveStatus();
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060010]">
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#060010] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">파일 업로드</h1>
          <p className="text-neutral-400">
            Google Drive 파일을 조회하거나 새로운 파일을 업로드하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Google Drive 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0a0015] border border-neutral-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <LuCloud className="text-blue-400" size={24} />
              <div>
                <h2 className="text-xl font-semibold">Google Drive</h2>
                <p className="text-sm text-neutral-400">
                  연동된 Google Drive 파일 목록
                </p>
              </div>
            </div>

            {isCheckingDrive ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-neutral-400">연동 상태 확인 중...</div>
              </div>
            ) : isGoogleDriveConnected ? (
              <GoogleDriveFiles />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <LuCloud className="text-neutral-600 mb-4" size={48} />
                <div className="text-neutral-400 mb-4">
                  Google Drive가 연동되지 않았습니다
                </div>
                <button
                  onClick={() => router.push("/settings")}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-sm"
                >
                  설정에서 연동하기
                </button>
              </div>
            )}
          </motion.div>

          {/* Supabase Storage 업로드 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-[#0a0015] border border-neutral-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <LuUpload className="text-purple-400" size={24} />
              <div>
                <h2 className="text-xl font-semibold">파일 업로드</h2>
                <p className="text-sm text-neutral-400">
                  Supabase Storage에 파일 업로드
                </p>
              </div>
            </div>

            <FileUpload />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
