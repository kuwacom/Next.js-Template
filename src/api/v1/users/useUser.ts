"use client";

import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { ApiResultError } from "@/lib/apiError";
import { User } from "@/types/v1/api";
import useSWR from "swr";

export const userDetailKey = (userId: string, authVersion: number) =>
  ["users", "detail", userId, authVersion] as const;

async function getUserRequest(userId: string): Promise<User> {
  const res = await apiClient.get<User>(`/users/${userId}`);
  return res.data!;
}

export function useUser(userId: string | null) {
  const { authVersion } = useAuth();
  const swr = useSWR<User, ApiResultError | Error>(
    userId ? userDetailKey(userId, authVersion) : null,
    () => getUserRequest(userId!),
  );

  return {
    ...swr,
    user: swr.data,
    error: swr.error,
  };
}
