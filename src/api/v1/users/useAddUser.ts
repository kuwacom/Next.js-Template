"use client";

import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { ApiResultError } from "@/lib/apiError";
import { User, UserRequest, UserResponse } from "@/types/v1/api";
import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import { usersListKey } from "./useUsers";

const addUserKey = (authVersion: number) =>
  ["users", "add", authVersion] as const;

async function addUserRequest(user: UserRequest): Promise<User> {
  const res = await apiClient.post<UserResponse>("/users", user);
  return res.data!;
}

export function useAddUser() {
  const { authVersion } = useAuth();
  const { mutate } = useSWRConfig();
  const mutation = useSWRMutation<
    User,
    ApiResultError | Error,
    ReturnType<typeof addUserKey>,
    UserRequest
  >(addUserKey(authVersion), async (_key, { arg }) => addUserRequest(arg));

  const addUser = async (user: UserRequest): Promise<User> => {
    const createdUser = await mutation.trigger(user);

    // cacheを変更しないで再取得する場合
    // await mutate(usersListKey(authVersion));

    await mutate(
      usersListKey(authVersion),
      (currentUsers: User[] = []) => [...currentUsers, createdUser],
      {
        revalidate: false,
      },
    );
    return createdUser;
  };

  return {
    ...mutation,
    addUser,
  };
}
