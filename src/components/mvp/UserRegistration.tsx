"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { LuCheck, LuLogIn, LuUserPlus } from "react-icons/lu";

export function UserRegistration() {
  const { isSignedIn, user } = useUser();

  if (isSignedIn) {
    return (
      <div className="p-8 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
        <LuCheck className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          로그인되었습니다!
        </h3>
        <p className="text-green-700 dark:text-green-300">
          환영합니다, {user?.emailAddresses[0]?.emailAddress}님
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          지금 시작하세요
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          무료로 가입하고 모든 기능을 사용해보세요
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <SignUpButton mode="modal">
          <button className="w-full py-4 px-6 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
            <LuUserPlus className="w-5 h-5" />
            회원가입
          </button>
        </SignUpButton>

        <SignInButton mode="modal">
          <button className="w-full py-4 px-6 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            <LuLogIn className="w-5 h-5" />
            로그인
          </button>
        </SignInButton>
      </div>

      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
        가입 시{" "}
        <a
          href="#"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          이용약관
        </a>
        과{" "}
        <a
          href="#"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          개인정보처리방침
        </a>
        에 동의하게 됩니다.
      </p>
    </div>
  );
}
