import { redirect } from "next/navigation";
import { getSiteMode } from "@/lib/site-settings";
import { EmailCollector } from "@/components/EmailCollector";
import { LuSparkles, LuLayoutDashboard } from "react-icons/lu";
import { checkIsAdmin } from "@/lib/clerk";
import Link from "next/link";
import { FadeIn, SplitText, Orb } from "@/components/react-bits";

export default async function Home() {
  const siteMode = await getSiteMode();

  // MVP 모드일 때는 /addcow로 리다이렉트
  if (siteMode === "mvp") {
    redirect("/addcow");
  }

  // 관리자인지 확인
  const adminInfo = await checkIsAdmin();

  // Default: faked_door mode (이메일 수집 페이지)
  return (
    <div className="h-screen overflow-hidden relative">
      <div className="fixed inset-0 z-0 w-full h-full">
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
        />
      </div>
      <div className="relative z-10 pointer-events-none h-full flex flex-col items-center justify-center -mt-4">
        {/* Hero Section */}
        <div className="text-center">
        <FadeIn delay={0.1} duration={0.6}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="tooltip-wrapper pointer-events-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
                <LuSparkles className="w-4 h-4" />
                Coming Soon
              </div>
              <div className="tooltip">2026.02.01 by ADDCOW</div>
            </div>
            {adminInfo?.isAdmin && (
              <Link
                href="/admin"
                className="admin-dashboard-link w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto transition-all"
              >
                <LuLayoutDashboard className="w-4 h-4" />
              </Link>
            )}
          </div>
        </FadeIn>
        <h1 className="text-xl md:text-2xl text-gray-900 dark:text-gray-100 mb-2 leading-relaxed">
          <SplitText
            text="지금 대기자로 등록하고"
            delay={0.2}
            duration={0.5}
            className="block font-light"
          />
          <br />
          <span className="text-white dark:text-white block">
            <SplitText
              text="지식기반 자동화 마케팅을 경험해보세요"
              delay={0.5}
              duration={0.5}
              className="font-medium"
            />
          </span>
        </h1>
        </div>

        {/* Email Collector */}
        <FadeIn delay={0.8} duration={0.6}>
          <div className="flex justify-center mt-8 pointer-events-auto">
            <EmailCollector />
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
