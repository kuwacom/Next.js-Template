"use client";

import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { ApiResultError } from "@/lib/apiError";
import { DeleteUserResponse, User } from "@/types/v1/api";
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
    ApiResultError | Error,
    ReturnType<typeof deleteUserKey>,
    string
  >(deleteUserKey(authVersion), async (_key, { arg }) =>
    deleteUserRequest(arg),
  );

  const deleteUser = async (
    userId: string,
  ): Promise<DeleteUserResponse> => {
    const deletedUser = await mutation.trigger(userId);

    // cacheを変更しないで再取得する場合
    // await mutate(usersListKey(authVersion));
    // await mutate(userDetailKey(userId, authVersion));

    await mutate(
      usersListKey(authVersion),
      (currentUsers: User[] = []) =>
        currentUsers.filter((user) => user.id !== deletedUser.user.id),
      {
        revalidate: false,
      },
    );
    await mutate(userDetailKey(userId, authVersion), undefined, {
      populateCache: false,
      revalidate: false,
    });
    return deletedUser;
  };

  return {
    ...mutation,
    deleteUser,
  };
}
