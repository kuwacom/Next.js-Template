import { apiClient } from "@/api/apiClient";

/**
 * key は SWR の key（例: '/engines'）を想定
 * 単純な GET リクエストを送り、結果の data 部分を返す
 */
export async function apiFetcher<T = any>(key: string): Promise<T> {
  try {
    // apiClient.get は { data: T } を返す実装想定
    const res = await apiClient.get<T>(key);
    // 実装によっては res.data が undefined の場合があるので guard
    if ("data" in res) return res.data as T;
    // もし APIClient がエラーではなく { error } を返す設計なら適宜対応
    throw new Error("Invalid API response");
  } catch (err: any) {
    // APIClient が独自の APIError を throw するなら、それをそのまま再投げして
    // SWR の error ハンドリングに委ねる（status 等も含めると便利）
    // ここで再整形しておくとコンポーネント側で取り扱いやすい
    const apiError = err as any;
    if (apiError?.status) {
      const e = new Error(apiError.message || "API Error");
      (e as any).status = apiError.status;
      (e as any).data = apiError.data ?? null;
      throw e;
    }
    throw err;
  }
}
