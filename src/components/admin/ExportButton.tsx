"use client";

import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ko } from "date-fns/locale";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuDownload,
  LuFileDown,
  LuLoader,
  LuX,
} from "react-icons/lu";

interface ExportButtonProps {
  type: "submissions" | "users";
}

export function ExportButton({ type }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("csv");
  const [showDateRange, setShowDateRange] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [clickCount, setClickCount] = useState(0); // 0: 첫 클릭 대기, 1: 두 번째 클릭 대기
  const calendarRef = useRef<HTMLDivElement>(null);

  // 캘린더 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 캘린더 날짜 선택 (GA4 스타일)
  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    if (clickCount === 0) {
      // 첫 번째 클릭: 시작일 설정 (종료일도 같은 날짜로)
      setStartDate(dateStr);
      setEndDate(dateStr);
      setClickCount(1);
    } else {
      // 두 번째 클릭: 종료일 설정
      const start = new Date(startDate);
      if (date < start) {
        // 시작일보다 이전이면 swap
        setStartDate(dateStr);
        setEndDate(startDate);
      } else {
        setEndDate(dateStr);
      }
      setClickCount(0); // 다음 클릭은 다시 시작일부터
    }
  };

  // 캘린더 날짜 생성
  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  };

  // 날짜가 선택 범위 내인지 확인
  const isInRange = (date: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return isWithinInterval(date, { start, end });
  };

  const isStartDate = (date: Date) => isSameDay(date, new Date(startDate));
  const isEndDate = (date: Date) => isSameDay(date, new Date(endDate));

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

      if (showDateRange) {
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
    if (showDateRange) {
      return `${type}-${startDate}-to-${endDate}.${formatExt}`;
    }
    return `${type}-${format(new Date(), "yyyy-MM-dd")}.${formatExt}`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Date Range Calendar - 캘린더 아이콘을 CSV 옆에 배치 */}
      {(
        <div className="relative" ref={calendarRef}>
          <button
            onClick={() => {
              setShowCalendar(!showCalendar);
              if (!showDateRange) setShowDateRange(true);
            }}
            className={`h-[26px] px-2 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
              showDateRange
                ? "bg-purple-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700"
            }`}
            title="날짜 범위 설정"
          >
            <LuCalendar className="w-3 h-3" />
            {showDateRange && (
              <span className="text-[10px] hidden sm:inline">
                {format(new Date(startDate), "M.d", { locale: ko })} - {format(new Date(endDate), "M.d", { locale: ko })}
              </span>
            )}
          </button>

          {/* Calendar Dropdown */}
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 z-50 bg-[#0a0015] border border-purple-900/50 rounded-lg shadow-2xl shadow-purple-900/20 p-3 min-w-[280px]"
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1 hover:bg-purple-900/30 rounded transition-colors"
                  >
                    <LuChevronLeft className="w-4 h-4 text-purple-400" />
                  </button>
                  <span className="text-sm font-medium text-white">
                    {format(currentMonth, "yyyy년 M월", { locale: ko })}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1 hover:bg-purple-900/30 rounded transition-colors"
                  >
                    <LuChevronRight className="w-4 h-4 text-purple-400" />
                  </button>
                </div>

                {/* Selection Info */}
                <div className="flex items-center justify-center gap-2 mb-3 text-xs">
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {format(new Date(startDate), "yyyy년 M월 d일", { locale: ko })}
                  </span>
                  <span className="text-neutral-500">~</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {format(new Date(endDate), "yyyy년 M월 d일", { locale: ko })}
                  </span>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] font-medium text-neutral-500 py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth().map((date, idx) => {
                    const isCurrentMonth = isSameMonth(date, currentMonth);
                    const isSelected = isStartDate(date) || isEndDate(date);
                    const inRange = isInRange(date) && !isSelected;
                    const isStart = isStartDate(date);
                    const isEnd = isEndDate(date);

                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateSelect(date)}
                        disabled={!isCurrentMonth}
                        className={`
                          relative w-8 h-8 text-xs rounded transition-all
                          ${!isCurrentMonth ? "text-neutral-700 cursor-not-allowed" : ""}
                          ${isCurrentMonth && !isSelected && !inRange ? "text-neutral-300 hover:bg-purple-900/40" : ""}
                          ${isSelected ? "bg-purple-600 text-white font-medium" : ""}
                          ${inRange ? "bg-purple-900/30 text-purple-300 hover:bg-purple-900/50" : ""}
                          ${isStart ? "rounded-l-lg rounded-r-none" : ""}
                          ${isEnd ? "rounded-r-lg rounded-l-none" : ""}
                          ${isStart && isEnd ? "rounded-lg" : ""}
                        `}
                      >
                        {format(date, "d")}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Select */}
                <div className="flex gap-1 mt-3 pt-3 border-t border-neutral-800">
                  {[
                    { label: "7일", days: 7 },
                    { label: "30일", days: 30 },
                    { label: "90일", days: 90 },
                  ].map(({ label, days }) => (
                    <button
                      key={days}
                      onClick={() => {
                        setStartDate(format(subDays(new Date(), days), "yyyy-MM-dd"));
                        setEndDate(format(new Date(), "yyyy-MM-dd"));
                        setClickCount(0); // 리셋
                      }}
                      className="flex-1 px-2 py-1 text-[10px] font-medium bg-neutral-800 hover:bg-purple-900/40 text-neutral-300 rounded transition-colors"
                    >
                      최근 {label}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setShowDateRange(false);
                      setShowCalendar(false);
                      setStartDate(format(new Date(), "yyyy-MM-dd"));
                      setEndDate(format(new Date(), "yyyy-MM-dd"));
                      setClickCount(0);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
                  >
                    초기화
                  </button>
                  <button
                    onClick={() => {
                      setShowCalendar(false);
                      setClickCount(0);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  >
                    확인
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Format Selector */}
      <div className="flex gap-1">
        <button
          onClick={() => setExportFormat("csv")}
          className={`h-[26px] px-2 rounded text-xs font-medium transition-colors ${
            exportFormat === "csv"
              ? "bg-purple-600 text-white"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700"
          }`}
        >
          CSV
        </button>
        <button
          onClick={() => setExportFormat("excel")}
          className={`h-[26px] px-2 rounded text-xs font-medium transition-colors ${
            exportFormat === "excel"
              ? "bg-purple-600 text-white"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700"
          }`}
        >
          Excel
        </button>
      </div>

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

