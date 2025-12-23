import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeClient } from "@/components/HomeClient";
import { checkIsAdmin } from "@/lib/clerk";
import { getSiteMode } from "@/lib/site-settings";

export default async function Home() {
  const siteMode = await getSiteMode();

  // MVP 모드일 때는 /addcow로 리다이렉트
  if (siteMode === "mvp") {
    redirect("/addcow");
  }

  // 로그인 상태 확인
  const user = await currentUser();

  // 로그인되어 있으면 /home으로 리다이렉트
  if (user) {
    redirect("/home");
  }

  // 관리자인지 확인
  const adminInfo = await checkIsAdmin();

  // 로그인하지 않은 사용자: 마케팅/이메일 수집 페이지
  return <HomeClient isAdmin={adminInfo?.isAdmin || false} />;
}
