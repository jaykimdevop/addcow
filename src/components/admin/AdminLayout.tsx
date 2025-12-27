"use client";

import { motion } from "motion/react";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  useEffect(() => {
    // 관리자 페이지에서 스크롤 허용
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";

    return () => {
      // 컴포넌트 언마운트 시 원래대로 복원
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060010] text-white">
      <div className="container mx-auto px-4 py-6 pb-32 lg:pb-6 max-w-5xl">
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            mass: 0.5,
            stiffness: 200,
            damping: 20,
          }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
