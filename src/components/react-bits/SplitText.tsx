"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface SplitTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export function SplitText({
  text,
  delay = 0,
  duration = 0.5,
  className = "",
}: SplitTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, index) => (
        <span key={index} className="inline-block mr-1">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={`${index}-${charIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isVisible ? 1 : 0,
                y: isVisible ? 0 : 20,
              }}
              transition={{
                duration,
                delay: delay + index * 0.1 + charIndex * 0.03,
                ease: "easeOut",
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}
