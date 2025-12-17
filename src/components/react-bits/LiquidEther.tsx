"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface LiquidEtherProps {
  className?: string;
  colors?: string[];
  intensity?: number;
}

export function LiquidEther({
  className = "",
  colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"],
  intensity = 0.5,
}: LiquidEtherProps) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  if (!mounted) {
    return (
      <div className={`fixed inset-0 -z-10 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 -z-10 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      
      {/* Animated blobs */}
      {colors.map((color, index) => {
        const baseX = [20, 80, 50, 30][index] || 50;
        const baseY = [30, 70, 50, 80][index] || 50;
        
        return (
          <motion.div
            key={index}
            className="absolute rounded-full blur-3xl opacity-60 dark:opacity-40"
            style={{
              width: "500px",
              height: "500px",
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              left: `${baseX}%`,
              top: `${baseY}%`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              left: [
                `${baseX}%`,
                `${baseX + Math.sin(index) * 20}%`,
                `${baseX + Math.cos(index) * 15}%`,
                `${baseX}%`,
              ],
              top: [
                `${baseY}%`,
                `${baseY + Math.cos(index) * 20}%`,
                `${baseY + Math.sin(index) * 15}%`,
                `${baseY}%`,
              ],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{
              duration: 20 + index * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Mouse-interactive blob */}
      <motion.div
        className="absolute rounded-full blur-3xl opacity-30 dark:opacity-20 pointer-events-none"
        style={{
          width: "400px",
          height: "400px",
          background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 30,
        }}
      />
    </div>
  );
}
