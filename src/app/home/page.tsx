import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeClient } from "@/components/HomeClient";

export default async function HomePage() {
  // 로그인 확인
  const user = await currentUser();

  // 로그인되지 않았으면 /로 리다이렉트
  if (!user) {
    redirect("/");
  }

  // 로그인된 사용자 화면 (Dock 표시)
  return <HomeClient />;
}
