"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { LuCheck, LuLoader, LuUpload, LuX } from "react-icons/lu";

interface UploadedFile {
  name: string;
  size: number;
  status: "uploading" | "success" | "error";
  progress?: number;
  error?: string;
}

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            status: "error",
            error: `파일 크기가 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과합니다`,
          },
        ]);
        return false;
      }
      return true;
    });

    for (const file of validFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    // 업로드 시작
    setUploadedFiles((prev) => [
      ...prev,
      {
        name: file.name,
        size: file.size,
        status: "uploading",
        progress: 0,
      },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "업로드 실패");
      }

      // 업로드 성공
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { ...f, status: "success" as const, progress: 100 }
            : f,
        ),
      );
    } catch (error) {
      // 업로드 실패
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? {
                ...f,
                status: "error" as const,
                error: error instanceof Error ? error.message : "업로드 실패",
              }
            : f,
        ),
      );
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-purple-500 bg-purple-500/10"
            : "border-neutral-700 hover:border-neutral-600 bg-neutral-900/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <LuUpload
            className={`${isDragging ? "text-purple-500" : "text-neutral-400"}`}
            size={48}
          />
          <div>
            <div className="text-white font-medium mb-1">
              파일을 드래그하거나 클릭하여 업로드
            </div>
            <div className="text-sm text-neutral-400">
              최대 {MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능
            </div>
          </div>
        </div>
      </div>

      {/* 업로드된 파일 목록 */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <div className="text-sm font-medium text-white mb-2">
              업로드된 파일 ({uploadedFiles.length})
            </div>
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800"
              >
                <div className="flex-shrink-0">
                  {file.status === "uploading" && (
                    <LuLoader
                      className="animate-spin text-purple-500"
                      size={20}
                    />
                  )}
                  {file.status === "success" && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <LuCheck className="text-white" size={12} />
                    </div>
                  )}
                  {file.status === "error" && (
                    <LuX className="text-red-500" size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                    {file.status === "error" && file.error && (
                      <span className="text-red-400 ml-2">• {file.error}</span>
                    )}
                  </div>
                  {file.status === "uploading" && (
                    <div className="mt-2 w-full bg-neutral-800 rounded-full h-1.5">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${file.progress || 0}%` }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.name);
                  }}
                  className="flex-shrink-0 p-1 hover:bg-neutral-800 rounded transition-colors"
                >
                  <LuX className="text-neutral-400" size={16} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
