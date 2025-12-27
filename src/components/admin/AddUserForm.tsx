"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuLoader, LuUserPlus } from "react-icons/lu";

export function AddUserForm() {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "viewer">("viewer");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) return;

    setIsAdding(true);
    setError(null);
    setSuccess(false);

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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add user");
      }

      setNewUserId("");
      setSuccess(true);
      router.refresh();

      // 성공 메시지 3초 후 사라지게
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add user");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border border-neutral-700 bg-[#060010]">
        <h2 className="text-sm font-semibold text-white mb-4">
          새 관리자 추가
        </h2>
        <form onSubmit={handleAddUser} className="space-y-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">
              Clerk User ID
            </label>
            <input
              type="text"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              placeholder="user_xxxxxxxxxxxxx"
              required
              className="w-full px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">
              역할
            </label>
            <select
              value={newUserRole}
              onChange={(e) =>
                setNewUserRole(e.target.value as "admin" | "viewer")
              }
              className="w-full px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
            >
              <option value="viewer">Viewer - 조회만 가능</option>
              <option value="admin">Admin - 모든 권한</option>
            </select>
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-900/20 border border-green-800 text-green-300 text-xs">
              관리자가 성공적으로 추가되었습니다.
            </div>
          )}
          <button
            type="submit"
            disabled={isAdding || !newUserId.trim()}
            className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-xs"
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

      <div className="p-4 rounded-lg border border-neutral-700 bg-[#060010]">
        <h3 className="text-xs font-semibold text-white mb-2">안내</h3>
        <ul className="space-y-1.5 text-xs text-neutral-400">
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>
              Clerk User ID는 Clerk 대시보드의 사용자 페이지에서 확인할 수
              있습니다.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>
              Viewer 역할은 데이터 조회만 가능하며, Admin 역할은 모든 관리 기능을
              사용할 수 있습니다.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>
              사용자를 추가한 후에는 사용자 관리 탭에서 확인할 수 있습니다.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

