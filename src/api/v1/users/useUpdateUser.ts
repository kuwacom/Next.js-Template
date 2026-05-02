"use client";

import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { ApiResultError } from "@/lib/apiError";
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

/**
 * React コンポーネントでは `useUpdateUser` を優先して使う
 *
 * `updateUserRequest` は hook の外から直接更新したい場合だけ使う
 */
export async function updateUserRequest(
  userId: string,
  user: UserRequest,
): Promise<User> {
  const res = await apiClient.put<UserResponse>(`/users/${userId}`, user);
  return res.data!;
}

export function useUpdateUser() {
  const { authVersion } = useAuth();
  const { mutate } = useSWRConfig();
  const mutation = useSWRMutation<
    User,
    ApiResultError | Error,
    ReturnType<typeof updateUserKey>,
    UpdateUserArgs
  >(updateUserKey(authVersion), async (_key, { arg }) =>
    updateUserRequest(arg.userId, arg.user),
  );

  const updateUser = async ({
    userId,
    user,
  }: UpdateUserArgs): Promise<User> => {
    const updatedUser = await mutation.trigger({ userId, user });

    await mutate(userDetailKey(userId, authVersion), updatedUser, {
      revalidate: false,
    });

    // cacheを変更しないで再取得する場合
    // await mutate(usersListKey(authVersion));

    await mutate(
      usersListKey(authVersion),
      (currentUsers: User[] = []) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser,
        ),
      {
        revalidate: false,
      },
    );

    return updatedUser;
  };

  return {
    ...mutation,
    updateUser,
  };
}
