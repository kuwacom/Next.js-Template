import { User, UserRequest, UserResponse } from "@/types/api";
import useSWR, { mutate } from "swr";
import { apiClient } from "@/api/apiClient";
import { apiFetcher } from "@/api/fetcher";

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<User[]>("/users", {
    revalidateIfStale: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
  });

  return {
    users: data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUser(userId: string | null) {
  const { data, error, isLoading } = useSWR<User>(
    userId ? `/users/${userId}` : null,
    apiFetcher,
    {
      revalidateIfStale: true,
      revalidateOnMount: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate: (data?: User) => mutate(`/users/${userId}`, data, false),
  };
}

export async function addUser(user: UserRequest): Promise<User> {
  try {
    const res = await apiClient.post<UserResponse>("/users", user);
    // Optionally update the cache for the users list
    mutate("/users");
    return res.data!;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(
  userId: string,
  user: UserRequest
): Promise<User> {
  try {
    const res = await apiClient.put<UserResponse>(`/users/${userId}`, user);
    // Update the cache for this user
    mutate(`/users/${userId}`, res.data, false);
    return res.data!;
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await apiClient.delete<UserResponse>(`/users/${userId}`);
    // Remove from cache
    mutate(`/users/${userId}`, null, false);
  } catch (error) {
    throw error;
  }
}
