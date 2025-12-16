"use client";

import { useState } from "react";
import { LuMail, LuCheck, LuLoader } from "react-icons/lu";
import { event } from "@/lib/analytics";

export function EmailCollector() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setIsSuccess(true);
      setEmail("");

      // Track event
      event({
        action: "email_submitted",
        category: "engagement",
        label: "waitlist_signup",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <LuCheck className="w-12 h-12 text-green-600 dark:text-green-400" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            Thank you!
          </h3>
          <p className="text-green-700 dark:text-green-300">
            We'll notify you when we launch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            disabled={isLoading}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full py-4 px-6 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <LuLoader className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Join Waitlist"
          )}
        </button>
      </div>
    </form>
  );
}

