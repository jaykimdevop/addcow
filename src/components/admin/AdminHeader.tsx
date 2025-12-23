"use client";

import { motion } from "motion/react";

interface AdminHeaderProps {
  title: string;
  description?: string;
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  return (
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
      <h1 className="text-xl font-bold text-white">{title}</h1>
      {description && (
        <p className="text-xs text-neutral-400 mt-1">{description}</p>
      )}
    </motion.div>
  );
}

