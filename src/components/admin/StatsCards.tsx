"use client";

import { motion } from "motion/react";
import { LuCalendar, LuMail, LuTrendingUp, LuUsers } from "react-icons/lu";

interface StatsCardsProps {
  total: number;
  today: number;
  week: number;
  month: number;
}

export function StatsCards({ total, today, week, month }: StatsCardsProps) {
  const stats = [
    {
      label: "전체 제출",
      value: total.toLocaleString(),
      icon: LuUsers,
      color: "blue",
    },
    {
      label: "오늘",
      value: today.toLocaleString(),
      icon: LuMail,
      color: "green",
    },
    {
      label: "이번 주",
      value: week.toLocaleString(),
      icon: LuTrendingUp,
      color: "purple",
    },
    {
      label: "이번 달",
      value: month.toLocaleString(),
      icon: LuCalendar,
      color: "orange",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-900/30 text-blue-400",
    green: "bg-green-900/30 text-green-400",
    purple: "bg-purple-900/30 text-purple-400",
    orange: "bg-orange-900/30 text-orange-400",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              mass: 0.5,
              stiffness: 200,
              damping: 20,
              delay: index * 0.05,
            }}
            className="p-4 rounded-2xl bg-[#060010] border border-neutral-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-xs text-neutral-400">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
