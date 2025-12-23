"use client";

import { motion } from "motion/react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#060010] text-white">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
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
