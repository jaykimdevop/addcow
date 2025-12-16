import { getSiteMode } from "@/lib/site-settings";
import { redirect } from "next/navigation";
import { EmailCollector } from "@/components/EmailCollector";
import { LuRocket, LuSparkles, LuUsers, LuLayoutDashboard } from "react-icons/lu";
import { checkIsAdmin } from "@/lib/clerk";
import Link from "next/link";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <LuSparkles className="w-4 h-4" />
              Coming Soon
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Something Amazing is
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Coming Soon
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
              Be the first to know when we launch. Join our waitlist and get
              early access to exclusive features.
            </p>
          </div>

          {/* Email Collector */}
          <div className="flex justify-center mb-16">
            <EmailCollector />
          </div>

          {/* Admin Dashboard Link */}
          {adminInfo?.isAdmin && (
            <div className="flex justify-center mb-16">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 hover:border-blue-300 dark:hover:border-blue-600 transition-all text-sm font-medium"
              >
                <LuLayoutDashboard className="w-4 h-4" />
                관리자 대시보드
              </Link>
            </div>
          )}

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-24">
            <div className="text-center p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                <LuRocket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Early Access
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get exclusive access before the public launch
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-4">
                <LuSparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Exclusive Features
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access to premium features and updates
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                <LuUsers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Join the Community
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with like-minded early adopters
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
