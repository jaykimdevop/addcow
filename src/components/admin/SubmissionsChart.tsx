"use client";

import { eachDayOfInterval, format, parseISO, startOfDay } from "date-fns";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SubmissionsChartProps {
  data: Array<{ created_at: string }>;
}

export function SubmissionsChart({ data }: SubmissionsChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    // Get date range
    const dates = data.map((d) => parseISO(d.created_at));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Create all days in range
    const allDays = eachDayOfInterval({
      start: startOfDay(minDate),
      end: startOfDay(maxDate),
    });

    // Count submissions per day
    const countsByDay = new Map<string, number>();
    data.forEach((item) => {
      const day = format(parseISO(item.created_at), "yyyy-MM-dd");
      countsByDay.set(day, (countsByDay.get(day) || 0) + 1);
    });

    // Create chart data
    return allDays.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      return {
        date: format(day, "MMM d"),
        count: countsByDay.get(dayStr) || 0,
      };
    });
  }, [data]);

  return (
    <div className="p-4 rounded-2xl bg-[#060010] border border-neutral-700">
      <h2 className="text-base font-semibold text-white mb-4">
        제출 추이 (최근 30일)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-neutral-700"
          />
          <XAxis dataKey="date" className="text-neutral-400" style={{ fontSize: '12px' }} />
          <YAxis className="text-neutral-400" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#060010",
              border: "1px solid #404040",
              borderRadius: "8px",
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: "#8b5cf6", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
