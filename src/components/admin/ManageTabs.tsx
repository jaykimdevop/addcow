"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExportButton } from "./ExportButton";

interface ManageTabsProps {
  currentTab: string;
  submissions: React.ReactNode;
  users: React.ReactNode;
  addUser?: React.ReactNode;
}

export function ManageTabs({
  currentTab,
  submissions,
  users,
  addUser,
}: ManageTabsProps) {
  const searchParams = useSearchParams();

  const getTabUrl = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    // tab이 변경되면 page를 1로 리셋
    if (tab !== currentTab) {
      params.set("page", "1");
    }
    return `/admin/users?${params.toString()}`;
  };

  // 내보내기 버튼을 표시할 탭인지 확인
  const showExportButton =
    currentTab === "submissions" || currentTab === "users";

  return (
    <div className="space-y-4">
      {/* Tabs with Export Button */}
      <div className="flex items-center justify-between border-b border-neutral-700">
        <div className="flex gap-2">
          <Link
            href={getTabUrl("submissions")}
            className={`px-3 md:px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              currentTab === "submissions"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-neutral-400 hover:text-neutral-300"
            }`}
          >
            <span className="hidden md:inline">제출 관리</span>
            <span className="md:hidden">제출</span>
          </Link>
          <Link
            href={getTabUrl("users")}
            className={`px-3 md:px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              currentTab === "users"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-neutral-400 hover:text-neutral-300"
            }`}
          >
            <span className="hidden md:inline">사용자 관리</span>
            <span className="md:hidden">사용자</span>
          </Link>
          {addUser && (
            <Link
              href={getTabUrl("add")}
              className={`px-3 md:px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                currentTab === "add"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-300"
              }`}
            >
              <span className="hidden md:inline">새 관리자 추가</span>
              <span className="md:hidden">관리자</span>
            </Link>
          )}
        </div>
        {showExportButton && (
          <div className="pb-2">
            <ExportButton
              type={currentTab === "submissions" ? "submissions" : "users"}
            />
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div>
        {currentTab === "submissions"
          ? submissions
          : currentTab === "add" && addUser
            ? addUser
            : users}
      </div>
    </div>
  );
}

