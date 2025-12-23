"use client";

import { format, subDays } from "date-fns";
import { useState } from "react";
import { LuCalendar, LuDownload, LuLoader } from "react-icons/lu";

export function ExportForm() {
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
      });

      const response = await fetch(`/api/admin/export?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `submissions-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          날짜 범위
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              시작일
            </label>
            <div className="relative">
              <LuCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              종료일
            </label>
            <div className="relative">
              <LuCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting || !startDate || !endDate}
        className="w-full py-3 px-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {isExporting ? (
          <>
            <LuLoader className="w-5 h-5 animate-spin" />
            내보내는 중...
          </>
        ) : (
          <>
            <LuDownload className="w-5 h-5" />
            CSV 내보내기
          </>
        )}
      </button>
    </div>
  );
}

