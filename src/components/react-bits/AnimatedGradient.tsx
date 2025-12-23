"use client";

import { motion } from "motion/react";

export function AnimatedGradient() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Light mode gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"
        animate={{
          background: [
            "linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #f3e8ff 100%)",
            "linear-gradient(135deg, #e0e7ff 0%, #ffffff 50%, #fce7f3 100%)",
            "linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #ecfdf5 100%)",
            "linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #f3e8ff 100%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {/* Dark mode gradient */}
      <motion.div
        className="absolute inset-0 hidden dark:block bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        animate={{
          background: [
            "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)",
            "linear-gradient(135deg, #1e1b4b 0%, #1f2937 50%, #312e81 100%)",
            "linear-gradient(135deg, #1a1f2e 0%, #1f2937 50%, #1e293b 100%)",
            "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
