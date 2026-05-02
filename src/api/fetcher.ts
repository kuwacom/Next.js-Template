import { apiClient } from "@/api/apiClient";

/**
 * key は SWR の key（例: '/engines'）を想定
 * 単純な GET リクエストを送り、結果の data 部分を返す
 */
export async function apiFetcher<T = unknown>(key: string): Promise<T> {
  // apiClient が throw した値は SWR の error にそのまま渡す
  const res = await apiClient.get<T>(key);
  if ("data" in res) return res.data as T;

  throw new Error("Invalid API response");
}
