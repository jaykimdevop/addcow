"use client";

import { useUser } from "@clerk/nextjs";
import { LuSparkles } from "react-icons/lu";
import { EmailCollector } from "@/components/EmailCollector";
import { FadeIn, SplitText } from "@/components/react-bits";

interface HeroSectionProps {
  showContent?: boolean;
}

export function HeroSection({ showContent = true }: HeroSectionProps) {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="relative z-10 pointer-events-none h-full flex flex-col items-center justify-center">
      {/* 로그인하지 않은 사용자 화면 */}
      {isLoaded && !isSignedIn && showContent && (
        <>
          <div className="text-center">
            <FadeIn delay={0.1} duration={0.6}>
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="pointer-events-auto">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--primary) 15%, transparent)",
                      color: "var(--primary)",
                      borderColor: "var(--primary)",
                    }}
                  >
                    <LuSparkles className="w-3.5 h-3.5" />
                    ADDCOW RAG BETA
                  </div>
                </div>
              </div>
            </FadeIn>
            <h1 className="text-lg md:text-2xl text-white mb-2 leading-relaxed min-h-[120px] flex flex-col justify-center">
              <SplitText
                text="24시간 전문가 지식베이스로 수행되는"
                delay={0.2}
                duration={0.5}
                className="block font-light"
              />
              <SplitText
                text="지식기반 자동화 마케팅을 경험해보세요"
                delay={0.5}
                duration={0.5}
                className="block font-medium"
              />
            </h1>
          </div>

          <div className="mt-4 min-h-[80px] flex items-start justify-center">
            <FadeIn delay={0.8} duration={0.6}>
              <div className="pointer-events-auto">
                <EmailCollector />
              </div>
            </FadeIn>
          </div>
        </>
      )}

      {/* 로그인한 사용자 화면 - Dock은 GlobalDock에서 처리 */}
    </div>
  );
}
