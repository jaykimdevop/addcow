import { format } from "date-fns";
import { LuMail, LuClock } from "react-icons/lu";

interface RecentSubmissionsProps {
  submissions: Array<{
    id: string;
    email: string;
    created_at: string;
  }>;
}

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  return (
    <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Recent Submissions
      </h2>
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No submissions yet
          </p>
        ) : (
          submissions.map((submission) => (
            <div
              key={submission.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <LuMail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {submission.email}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <LuClock className="w-3 h-3" />
                    {format(new Date(submission.created_at), "MMM d, yyyy HH:mm")}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

