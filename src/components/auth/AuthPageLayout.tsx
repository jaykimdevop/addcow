import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface AuthPageLayoutProps {
  icon: IconType;
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthPageLayout({
  icon: Icon,
  title,
  description,
  children,
}: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <Icon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
}
