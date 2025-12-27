"use client";

import { format, subDays } from "date-fns";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LuCalendar, LuDownload, LuFileDown, LuLoader, LuX } from "react-icons/lu";

interface ExportButtonProps {
  type: "submissions" | "users";
}

export function ExportButton({ type }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("csv");
  const [showDateRange, setShowDateRange] = useState(false);
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleExportClick = () => {
    if (showDateRange && (!startDate || !endDate)) {
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmExport = async () => {
    setShowConfirmModal(false);
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        type,
        format: exportFormat,
      });

      if (type === "submissions" && showDateRange) {
        params.set("start", startDate);
        params.set("end", endDate);
      }

      const response = await fetch(`/api/admin/export?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename =
        filenameMatch?.[1] ||
        `${type}-${format(new Date(), "yyyy-MM-dd")}.${exportFormat === "excel" ? "xlsx" : "csv"}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("데이터 내보내기에 실패했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  const getFileName = () => {
    const formatExt = exportFormat === "excel" ? "xlsx" : "csv";
    if (type === "submissions" && showDateRange) {
      return `submissions-${startDate}-to-${endDate}.${formatExt}`;
    }
    return `${type}-${format(new Date(), "yyyy-MM-dd")}.${formatExt}`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Format Selector */}
      <div className="flex gap-1">
        <button
          onClick={() => setExportFormat("csv")}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            exportFormat === "csv"
              ? "bg-purple-600 text-white"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700"
          }`}
        >
          CSV
        </button>
        <button
          onClick={() => setExportFormat("excel")}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            exportFormat === "excel"
              ? "bg-purple-600 text-white"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700"
          }`}
        >
          Excel
        </button>
      </div>

      {/* Date Range (only for submissions) */}
      {type === "submissions" && showDateRange && (
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <LuCalendar className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-7 pr-1.5 py-1 rounded border border-neutral-700 bg-neutral-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <span className="text-xs text-neutral-400">~</span>
          <div className="relative">
            <LuCalendar className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-7 pr-1.5 py-1 rounded border border-neutral-700 bg-neutral-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Toggle Date Range (only for submissions) */}
      {type === "submissions" && (
        <button
          onClick={() => setShowDateRange(!showDateRange)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
            showDateRange
              ? "bg-purple-600 text-white"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700"
          }`}
          title="날짜 범위 설정"
        >
          <LuCalendar className="w-3 h-3" />
        </button>
      )}

      {/* Export Button */}
      <button
        onClick={handleExportClick}
        disabled={isExporting || (showDateRange && (!startDate || !endDate))}
        className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 text-xs"
      >
        {isExporting ? (
          <>
            <LuLoader className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden sm:inline">내보내는 중...</span>
          </>
        ) : (
          <>
            <LuFileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {type === "submissions" ? "제출 내역" : "사용자"} 내보내기
            </span>
            <span className="sm:hidden">내보내기</span>
          </>
        )}
      </button>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] pointer-events-auto"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-32 -translate-x-1/2 w-full max-w-sm bg-[#060010] border border-neutral-700 rounded-lg shadow-2xl z-[101] pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-neutral-700">
                <h2 className="text-sm font-semibold text-white">
                  데이터 내보내기
                </h2>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="p-1 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <LuX className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-3 space-y-3">
                <p className="text-xs text-neutral-300">
                  다음 파일로 다운로드하시겠습니까?
                </p>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-700">
                  <p className="text-xs font-mono text-purple-400 break-all">
                    {getFileName()}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>형식:</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {exportFormat.toUpperCase()}
                  </span>
                  {type === "submissions" && showDateRange && (
                    <>
                      <span className="mx-1">•</span>
                      <span>날짜:</span>
                      <span className="text-neutral-300 text-[10px]">
                        {startDate} ~ {endDate}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 p-3 border-t border-neutral-700">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmExport}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <LuDownload className="w-3.5 h-3.5" />
                  다운로드
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

