"use client";

import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { User, UserRequest, UserResponse } from "@/types/v1/api";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import { userDetailKey } from "./useUser";
import { usersListKey } from "./useUsers";

type UpdateUserArgs = {
  userId: string;
  user: UserRequest;
};

const updateUserKey = (authVersion: number) =>
  ["users", "update", authVersion] as const;

// React コンポーネントでは `useUpdateUser` をメインで使い、
// SWR キャッシュ同期込みで更新してください。
// `updateUserRequest` は例外的な non-hook 利用のために残しています。
export async function updateUserRequest(
  userId: string,
  user: UserRequest
): Promise<User> {
  const res = await apiClient.put<UserResponse>(`/users/${userId}`, user);
  return res.data!;
}

export function useUpdateUser() {
  const { authVersion } = useAuth();
  const { mutate } = useSWRConfig();
  const mutation = useSWRMutation<
    User,
    Error,
    ReturnType<typeof updateUserKey>,
    UpdateUserArgs
  >(
    updateUserKey(authVersion),
    async (_key, { arg }) => updateUserRequest(arg.userId, arg.user)
  );

  const updateUser = async ({ userId, user }: UpdateUserArgs) => {
    const updatedUser = await mutation.trigger({ userId, user });
    await mutate(userDetailKey(userId, authVersion), updatedUser, {
      revalidate: false,
    });
    await mutate(usersListKey(authVersion));
    return updatedUser;
  };

  return {
    ...mutation,
    updateUser,
  };
}
