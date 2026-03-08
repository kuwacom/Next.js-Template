"use client";

import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { DeleteUserResponse } from "@/types/v1/api";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import { userDetailKey } from "./useUser";
import { usersListKey } from "./useUsers";

const deleteUserKey = (authVersion: number) =>
  ["users", "delete", authVersion] as const;

async function deleteUserRequest(userId: string): Promise<DeleteUserResponse> {
  const res = await apiClient.delete<DeleteUserResponse>(`/users/${userId}`);
  return res.data!;
}

export function useDeleteUser() {
  const { authVersion } = useAuth();
  const { mutate } = useSWRConfig();
  const mutation = useSWRMutation<
    DeleteUserResponse,
    Error,
    ReturnType<typeof deleteUserKey>,
    string
  >(deleteUserKey(authVersion), async (_key, { arg }) => deleteUserRequest(arg));

  const deleteUser = async (userId: string) => {
    const deletedUser = await mutation.trigger(userId);
    await mutate(usersListKey(authVersion));
    await mutate(userDetailKey(userId, authVersion));
    return deletedUser;
  };

  return {
    ...mutation,
    deleteUser,
  };
}
