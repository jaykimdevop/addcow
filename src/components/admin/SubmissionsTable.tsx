"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LuChevronLeft,
  LuChevronRight,
  LuMail,
} from "react-icons/lu";

interface Submission {
  id: string;
  email: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

interface SubmissionsTableProps {
  submissions: Submission[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function SubmissionsTable({
  submissions,
  currentPage,
  totalPages,
  totalCount,
}: SubmissionsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    params.set("tab", "submissions");
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border border-neutral-700 bg-[#060010] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  이메일
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  제출일시
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-8 text-center text-neutral-400 text-xs"
                  >
                    제출 내역이 없습니다
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-neutral-900 transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <LuMail className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-xs font-medium text-white">
                          {submission.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-neutral-400">
                      {format(
                        new Date(submission.created_at),
                        "yyyy.MM.dd HH:mm",
                        { locale: ko }
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-neutral-400 font-mono">
                      {submission.id.slice(0, 8)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            {(currentPage - 1) * 20 + 1} - {Math.min(currentPage * 20, totalCount)} / {totalCount}개
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LuChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 text-xs text-neutral-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LuChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
