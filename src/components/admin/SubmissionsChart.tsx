"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, eachDayOfInterval, startOfDay } from "date-fns";

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
    <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Submissions Over Time (Last 30 Days)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis
            dataKey="date"
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis className="text-gray-600 dark:text-gray-400" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

