import { format } from "date-fns";
import { LuClock, LuMail } from "react-icons/lu";

interface RecentSubmissionsProps {
  submissions: Array<{
    id: string;
    email: string;
    created_at: string;
  }>;
}

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  return (
    <div className="p-4 rounded-2xl bg-[#060010] border border-neutral-700">
      <h2 className="text-base font-semibold text-white mb-4">
        최근 제출 내역
      </h2>
      <div className="space-y-3">
        {submissions.length === 0 ? (
          <p className="text-neutral-400 text-center py-8 text-xs">
            제출 내역이 없습니다
          </p>
        ) : (
          submissions.map((submission) => (
            <div
              key={submission.id}
              className="flex items-center justify-between p-3 rounded-lg bg-neutral-900 border border-neutral-700"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-900/30 text-blue-400">
                  <LuMail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">
                    {submission.email}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <LuClock className="w-3 h-3" />
                    {format(
                      new Date(submission.created_at),
                      "MMM d, yyyy HH:mm",
                    )}
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
