import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeClient } from "@/components/HomeClient";
import { checkIsAdmin } from "@/lib/clerk";
import { getSiteMode } from "@/lib/site-settings";

export default async function Home() {
  // 병렬로 데이터 가져오기
  const [siteMode, user] = await Promise.all([
    getSiteMode(),
    currentUser(),
  ]);

  // 로그인되어 있으면 /home으로 리다이렉트
  if (user) {
    redirect("/home");
  }

  // 로그인하지 않은 사용자만 adminInfo 확인
  const adminInfo = await checkIsAdmin();

  // 로그인하지 않은 사용자: Orb 디자인의 마케팅 페이지
  // FD 모드: 대기자 등록 폼, MVP 모드: 로그인 버튼
  return <HomeClient isAdmin={adminInfo?.isAdmin || false} siteMode={siteMode} />;
}
