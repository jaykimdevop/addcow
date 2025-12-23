"use client";

import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuMail,
  LuSearch,
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
  search: string;
}

export function SubmissionsTable({
  submissions,
  currentPage,
  totalPages,
  totalCount,
  search: initialSearch,
}: SubmissionsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/admin/submissions?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/submissions?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이메일로 검색..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-medium transition-colors text-sm"
        >
          검색
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-700 bg-[#060010] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  이메일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  제출일시
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-12 text-center text-neutral-400 text-xs"
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
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <LuMail className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm font-medium text-white">
                          {submission.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-400">
                      {format(
                        new Date(submission.created_at),
                        "MMM d, yyyy HH:mm",
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-400 font-mono">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LuChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-xs text-neutral-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LuChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
