/**
 * React Hot Toast Provider
 * 전역 toast 알림을 위한 프로바이더
 */

"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      containerStyle={{
        top: "50%",
        transform: "translateY(-50%)",
      }}
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 2500,
        style: {
          background: "rgba(6, 0, 16, 0.95)",
          color: "#fff",
          borderRadius: "16px",
          padding: "16px 24px",
          border: "1px solid rgba(124, 77, 212, 0.3)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(124, 77, 212, 0.2)",
          fontSize: "14px",
          fontWeight: "500",
        },
        success: {
          duration: 2500,
          iconTheme: {
            primary: "#7c4dd4",
            secondary: "#fff",
          },
          style: {
            border: "1px solid rgba(124, 77, 212, 0.5)",
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
          style: {
            border: "1px solid rgba(239, 68, 68, 0.5)",
          },
        },
      }}
    />
  );
}
