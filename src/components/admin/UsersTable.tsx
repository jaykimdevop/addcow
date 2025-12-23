"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LuEye,
  LuLoader,
  LuShield,
  LuTrash2,
  LuUserPlus,
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
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "viewer">("viewer");

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_user_id: newUserId.trim(),
          role: newUserRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add user");
      }

      const newUser = await response.json();
      setUsers([newUser, ...users]);
      setNewUserId("");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add user");
    } finally {
      setIsAdding(false);
    }
  };

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
      {/* Add User Form */}
      <div className="p-4 rounded-2xl border border-neutral-700 bg-[#060010]">
        <h2 className="text-base font-semibold text-white mb-4">
          새 관리자 추가
        </h2>
        <form onSubmit={handleAddUser} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              placeholder="Clerk User ID"
              required
              className="w-full px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
          <select
            value={newUserRole}
            onChange={(e) =>
              setNewUserRole(e.target.value as "admin" | "viewer")
            }
            className="px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={isAdding}
            className="px-6 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
          >
            {isAdding ? (
              <>
                <LuLoader className="w-4 h-4 animate-spin" />
                추가 중...
              </>
            ) : (
              <>
                <LuUserPlus className="w-4 h-4" />
                사용자 추가
              </>
            )}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-neutral-700 bg-[#060010] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  이메일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Clerk User ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  역할
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-neutral-400 text-xs"
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
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.clerkUser?.imageUrl ? (
                            <img
                              src={user.clerkUser.imageUrl}
                              alt={displayName}
                              className="w-10 h-10 rounded-full object-cover"
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
                                    "w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center fallback-icon";
                                  fallback.innerHTML =
                                    '<svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                              <LuUserPlus className="w-5 h-5 text-neutral-500" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">
                              {displayName}
                            </div>
                            {user.clerkUser?.username && (
                              <div className="text-xs text-neutral-400">
                                @{user.clerkUser.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
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
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-neutral-400">
                        {user.clerk_user_id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-900/30 text-purple-300"
                              : "bg-neutral-800 text-neutral-300"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <LuShield className="w-3 h-3" />
                          ) : (
                            <LuEye className="w-3 h-3" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-400">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isDeleting === user.id}
                          className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isDeleting === user.id ? (
                            <LuLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <LuTrash2 className="w-4 h-4" />
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
