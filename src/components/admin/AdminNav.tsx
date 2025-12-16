"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LuLayoutDashboard, LuFileText, LuUsers, LuDownload, LuHouse, LuSettings } from "react-icons/lu";

interface AdminNavProps {
  role: "admin" | "viewer";
}

export function AdminNav({ role }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LuLayoutDashboard },
    { href: "/admin/submissions", label: "Submissions", icon: LuFileText },
    ...(role === "admin"
      ? [
          { href: "/admin/settings", label: "Settings", icon: LuSettings },
          { href: "/admin/users", label: "Users", icon: LuUsers },
          { href: "/admin/export", label: "Export", icon: LuDownload },
        ]
      : []),
  ];

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <LuHouse className="w-5 h-5" />
              <span className="font-semibold">Faked Door</span>
            </Link>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <UserButton />
        </div>
      </div>
    </nav>
  );
}

