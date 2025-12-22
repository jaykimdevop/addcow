"use client";

import { useState, useEffect } from "react";
import { LuFolder, LuFile, LuImage, LuFileText, LuLoader2 } from "react-icons/lu";
import type { GoogleDriveFile } from "@/types/google-drive";

interface GoogleDriveFilesProps {
  folderId?: string;
}

export function GoogleDriveFiles({ folderId = "root" }: GoogleDriveFilesProps) {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState(folderId);
  const [folderStack, setFolderStack] = useState<string[]>(["root"]);

  const fetchFiles = async (folderIdToFetch: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/drive/files", window.location.origin);
      url.searchParams.set("folderId", folderIdToFetch);

      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 401) {
          setError("Google Drive가 연동되지 않았습니다. 설정에서 연동해주세요.");
        } else {
          setError("파일 목록을 불러오는데 실패했습니다.");
        }
        return;
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error("Error fetching Google Drive files:", err);
      setError("파일 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentFolderId);
  }, [currentFolderId]);

  const handleFolderClick = (folder: GoogleDriveFile) => {
    if (folder.mimeType === "application/vnd.google-apps.folder") {
      setFolderStack([...folderStack, folder.id]);
      setCurrentFolderId(folder.id);
    }
  };

  const handleBackClick = () => {
    if (folderStack.length > 1) {
      const newStack = [...folderStack];
      newStack.pop();
      setFolderStack(newStack);
      setCurrentFolderId(newStack[newStack.length - 1]);
    }
  };

  const getFileIcon = (file: GoogleDriveFile) => {
    if (file.mimeType === "application/vnd.google-apps.folder") {
      return <LuFolder className="text-blue-400" size={20} />;
    }

    if (file.mimeType?.startsWith("image/")) {
      return <LuImage className="text-green-400" size={20} />;
    }

    if (
      file.mimeType?.includes("pdf") ||
      file.mimeType?.includes("document") ||
      file.mimeType?.includes("text")
    ) {
      return <LuFileText className="text-red-400" size={20} />;
    }

    return <LuFile className="text-neutral-400" size={20} />;
  };

  const formatFileSize = (size?: string) => {
    if (!size) return "";
    const bytes = parseInt(size, 10);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && files.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LuLoader2 className="animate-spin text-purple-500" size={24} />
        <span className="ml-3 text-neutral-400">파일 목록을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-400 mb-2">{error}</div>
        <button
          onClick={() => fetchFiles(currentFolderId)}
          className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-neutral-400">
        폴더가 비어있습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {folderStack.length > 1 && (
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm text-neutral-300 mb-4"
        >
          <LuFolder size={16} />
          <span>뒤로가기</span>
        </button>
      )}

      <div className="space-y-1">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => handleFolderClick(file)}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              file.mimeType === "application/vnd.google-apps.folder"
                ? "hover:bg-neutral-800 cursor-pointer"
                : "hover:bg-neutral-800/50"
            }`}
          >
            <div className="flex-shrink-0">{getFileIcon(file)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {file.name}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {file.mimeType === "application/vnd.google-apps.folder"
                  ? "폴더"
                  : `${formatFileSize(file.size)} • ${formatDate(file.modifiedTime)}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
