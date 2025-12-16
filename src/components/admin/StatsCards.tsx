import { LuUsers, LuTrendingUp, LuCalendar, LuMail } from "react-icons/lu";

interface StatsCardsProps {
  total: number;
  today: number;
  week: number;
  month: number;
}

export function StatsCards({ total, today, week, month }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Submissions",
      value: total.toLocaleString(),
      icon: LuUsers,
      color: "blue",
    },
    {
      label: "Today",
      value: today.toLocaleString(),
      icon: LuMail,
      color: "green",
    },
    {
      label: "This Week",
      value: week.toLocaleString(),
      icon: LuTrendingUp,
      color: "purple",
    },
    {
      label: "This Month",
      value: month.toLocaleString(),
      icon: LuCalendar,
      color: "orange",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

