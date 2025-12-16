import { redirect } from "next/navigation";
import { getSiteMode } from "@/lib/site-settings";

export default async function Home() {
  const siteMode = await getSiteMode();

  if (siteMode === "mvp") {
    redirect("/mvp");
  }

  redirect("/faked-door");
}
