"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LuEye,
  LuLoader,
  LuShield,
  LuTrash2,
} from "react-icons/lu";

interface ClerkUserInfo {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  emailAddress: string | null;
  imageUrl: string | null;
}

interface AdminUser {
  id: string;
  clerk_user_id: string;
  role: "admin" | "viewer";
  created_at: string;
  clerkUser: ClerkUserInfo | null;
}

interface UsersTableProps {
  users: AdminUser[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("이 사용자를 삭제하시겠습니까?")) return;

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((u) => u.id !== id));
      router.refresh();
    } catch (error) {
      alert("Failed to delete user");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Users Table */}
      <div className="rounded-lg border border-neutral-700 bg-[#060010] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  이메일
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Clerk User ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  역할
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-neutral-400 text-xs"
                  >
                    관리자 사용자가 없습니다
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const displayName =
                    user.clerkUser?.firstName || user.clerkUser?.lastName
                      ? `${user.clerkUser.firstName || ""} ${user.clerkUser.lastName || ""}`.trim()
                      : user.clerkUser?.username || "Unknown User";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-neutral-900 transition-colors"
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {user.clerkUser?.imageUrl ? (
                            <img
                              src={user.clerkUser.imageUrl}
                              alt={displayName}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                // 이미지 로딩 실패 시 기본 아이콘 표시
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (
                                  parent &&
                                  !parent.querySelector(".fallback-icon")
                                ) {
                                  const fallback =
                                    document.createElement("div");
                                  fallback.className =
                                    "w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center fallback-icon";
                                  fallback.innerHTML =
                                    '<svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                              <LuUserPlus className="w-4 h-4 text-neutral-500" />
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-medium text-white">
                              {displayName}
                            </div>
                            {user.clerkUser?.username && (
                              <div className="text-[10px] text-neutral-400">
                                @{user.clerkUser.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-white">
                        {user.clerkUser?.emailAddress ? (
                          user.clerkUser.emailAddress
                        ) : user.clerkUser === null ? (
                          <span
                            className="text-yellow-400 italic"
                            title="Clerk API에서 사용자 정보를 가져오지 못했습니다. 콘솔을 확인하세요."
                          >
                            정보 없음
                          </span>
                        ) : (
                          <span className="text-neutral-500 italic">
                            이메일 없음
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-mono text-neutral-400">
                        {user.clerk_user_id}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                            user.role === "admin"
                              ? "bg-purple-900/30 text-purple-300"
                              : "bg-neutral-800 text-neutral-300"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <LuShield className="w-2.5 h-2.5" />
                          ) : (
                            <LuEye className="w-2.5 h-2.5" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-neutral-400">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isDeleting === user.id}
                          className="p-1.5 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isDeleting === user.id ? (
                            <LuLoader className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <LuTrash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
