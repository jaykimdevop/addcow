import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeClient } from "@/components/HomeClient";
import { checkIsAdmin } from "@/lib/clerk";
import { getSiteMode } from "@/lib/site-settings";

export default async function HomePage() {
  // 로그인 확인
  const user = await currentUser();

  // 로그인되지 않았으면 /main으로 리다이렉트
  if (!user) {
    redirect("/main");
  }

  // 관리자인지 확인
  const adminInfo = await checkIsAdmin();
  const siteMode = await getSiteMode();

  // 로그인된 사용자 화면 (Dock 표시)
  return <HomeClient isAdmin={adminInfo?.isAdmin || false} siteMode={siteMode} />;
}
