"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface AdminSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
  delay?: number;
  className?: string;
}

export function AdminSection({
  title,
  description,
  children,
  icon,
  delay = 0,
  className = "",
}: AdminSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        mass: 0.5,
        stiffness: 200,
        damping: 20,
        delay,
      }}
      className={`bg-[#060010] border border-neutral-700 rounded-2xl p-4 mb-4 ${className}`}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          {icon && <div className="text-neutral-400">{icon}</div>}
          <h2 className="text-base font-semibold text-white">{title}</h2>
        </div>
        {description && (
          <p className="text-xs text-neutral-400 mt-1">{description}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}

