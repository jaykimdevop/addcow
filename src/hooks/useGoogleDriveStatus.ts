/**
 * Google Drive 연동 상태를 확인하는 커스텀 훅
 * ProfileSection과 GoogleDriveSection에서 중복 코드 제거
 */

import { useEffect, useState } from "react";
import { ERROR_MESSAGES } from "@/lib/errors";
import type { DriveStatusResponse } from "@/types/api";

interface UseGoogleDriveStatusReturn {
  isConnected: boolean;
  isChecking: boolean;
  connectedAt?: string;
  email?: string;
  error?: string;
  refetch: () => Promise<void>;
}

export function useGoogleDriveStatus(): UseGoogleDriveStatusReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [connectedAt, setConnectedAt] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [error, setError] = useState<string>();

  const checkStatus = async () => {
    setIsChecking(true);
    setError(undefined);

    try {
      const response = await fetch("/api/drive/status");
      const data: DriveStatusResponse = await response.json();

      if (response.ok) {
        setIsConnected(data.connected || false);
        setConnectedAt(data.connectedAt);
        setEmail(data.email);
      } else {
        setIsConnected(false);
        setError(data.error || ERROR_MESSAGES.GOOGLE_DRIVE_STATUS_CHECK_FAILED);
      }
    } catch (err) {
      console.error("Error checking Google Drive status:", err);
      setIsConnected(false);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return {
    isConnected,
    isChecking,
    connectedAt,
    email,
    error,
    refetch: checkStatus,
  };
}
