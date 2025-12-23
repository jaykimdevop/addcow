"use client";

import { useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { Orb } from "@/components/react-bits";

interface HomeClientProps {
  isAdmin: boolean;
}

export function HomeClient({ isAdmin }: HomeClientProps) {
  const { isSignedIn, isLoaded } = useUser();
  const [showOrb, setShowOrb] = useState(true);
  const [orbAnimating, setOrbAnimating] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const prevSignedInRef = useRef<boolean | null>(null);

  // 로그인 시 Orb 애니메이션 트리거
  useEffect(() => {
    if (!isLoaded) return;

    // 이전 로그인 상태를 저장
    const prevSignedIn = prevSignedInRef.current;

    // 로그인 이벤트: 이전 상태가 false였고 현재 true인 경우
    if (prevSignedIn === false && isSignedIn && !orbAnimating) {
      setOrbAnimating(true);
      setShowContent(false); // 콘텐츠 즉시 숨김
      // 애니메이션 완료 후 Orb 제거
      setTimeout(() => {
        setShowOrb(false);
      }, 1500); // 애니메이션 시간과 동기화
    }

    // 로그아웃 이벤트: 이전 상태가 true였고 현재 false인 경우
    if (prevSignedIn === true && !isSignedIn) {
      setShowOrb(true); // Orb 다시 표시
      setShowContent(true); // 콘텐츠 다시 표시
      setOrbAnimating(false); // 애니메이션 상태 리셋
    }

    // 이미 로그인된 상태로 시작한 경우 (새로고침)
    if (prevSignedIn === null && isSignedIn) {
      setShowOrb(false); // Orb 즉시 숨김
      setShowContent(false); // 콘텐츠도 숨김
    }

    // 현재 상태 저장
    prevSignedInRef.current = isSignedIn;
  }, [isLoaded, isSignedIn, orbAnimating]);

  return (
    <div
      className="h-screen overflow-hidden relative"
      style={{ backgroundColor: "#060010" }}
    >
      {!isLoaded && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
            />
            <p className="text-white text-sm opacity-70">로딩 중...</p>
          </motion.div>
        </div>
      )}
      <AnimatePresence>
        {showOrb && isLoaded && (!isSignedIn || orbAnimating) && (
          <motion.div
            className="fixed inset-0 z-0 w-full h-full"
            initial={{ scale: 1, opacity: 1 }}
            animate={
              orbAnimating
                ? {
                    scale: 3,
                    opacity: 0,
                    rotate: 360,
                  }
                : {
                    scale: 1,
                    opacity: 1,
                  }
            }
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
            }}
          >
            <Orb
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={0}
              forceHoverState={orbAnimating}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <HeroSection isAdmin={isAdmin} showContent={showContent} />
    </div>
  );
}
