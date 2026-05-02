"use client";

import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/api/apiClient";
import { ApiResultError } from "@/lib/apiError";
import { User } from "@/types/v1/api";
import useSWR from "swr";

export const usersListKey = (authVersion: number) =>
  ["users", "list", authVersion] as const;

async function getUsersRequest(): Promise<User[]> {
  const res = await apiClient.get<User[]>("/users");
  return res.data ?? [];
}

export function useUsers() {
  const { authVersion } = useAuth();
  const swr = useSWR<User[], ApiResultError | Error>(
    usersListKey(authVersion),
    () => getUsersRequest(),
  );

  return {
    ...swr,
    users: swr.data ?? [],
    error: swr.error,
  };
}
