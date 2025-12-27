import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeClient } from "@/components/HomeClient";

export default async function Home() {
  const user = await currentUser();

  // 로그인되어 있으면 /home으로 리다이렉트
  if (user) {
    redirect("/home");
  }

  // 로그인하지 않은 사용자: Orb 디자인의 마케팅 페이지
  return <HomeClient />;
}
