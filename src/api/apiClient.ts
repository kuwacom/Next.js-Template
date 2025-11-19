import logger from "@/services/logger";
import { paths } from "@/types/openapi";
import createClient from "openapi-fetch";

// エラーハンドリング用のカスタムエラークラス
class APIError<T> extends Error {
  constructor(public status: number, public data: T, message?: string) {
    super(message);
    this.name = "APIError";
  }
}

// クライアント設定インターフェース
interface APIClientConfig {
  baseUrl: string;
  timeout?: number;
}

// リクエストオプション
interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  body?: any;
}

export class APIClient {
  private readonly config: APIClientConfig;
  private readonly client: ReturnType<typeof createClient<paths>>;

  constructor(config: APIClientConfig) {
    this.config = config;
    // defaultでjsonを付ける
    this.client = createClient<paths>({
      baseUrl: config.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // ユーザートークン取得
  private getUserToken(): string | null {
    // 現状は localStorage から取得する実装
    // あとで useAuth から取得する形に変更
    try {
      return typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;
    } catch {
      return null;
    }
  }

  // 汎用リクエストメソッド
  private async request<T, U>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    path: string,
    options?: RequestOptions
  ): Promise<{ data: T; error?: undefined } | { data?: undefined; error: U }> {
    const timeout = options?.timeout || this.config.timeout || 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // ヘッダーの準備
      const headers: Record<string, string> = {
        ...options?.headers,
      };

      // 認証ヘッダーの追加
      if (this.getUserToken()) {
        headers["Authorization"] = `Bearer ${this.getUserToken()}`;
      }

      logger.debug(`== API Request ==\n${method} ${path}`, { headers });

      // リクエストの実行
      const response = await (this.client[method] as any)(path, {
        ...(options?.body && { body: options.body }),
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.error) {
        logger.warn(`API Error: ${method} ${path}`, {
          status: response.response.status,
          error: response.error,
        });

        throw new APIError(
          response.response.status,
          response.error,
          `API Error: ${response.response.status}`
        );
      }

      logger.debug(`API Success: ${method} ${path}`);
      return { data: response.data as T };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      logger.error(`API Request Failed: ${method} ${path}`, error);

      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      throw new Error(`Network error: ${error.message}`);
    }
  }

  // 各HTTPメソッドのラッパー
  async get<T = unknown, U = unknown>(path: string, options?: RequestOptions) {
    return this.request<T, U>("GET", path, options);
  }

  async post<T = unknown, U = unknown>(
    path: string,
    body?: any,
    options?: RequestOptions
  ) {
    return this.request<T, U>("POST", path, {
      ...options,
      body: this.formatBody(body, options?.headers?.["Content-Type"]),
    });
  }

  async put<T = unknown, U = unknown>(
    path: string,
    body?: any,
    options?: RequestOptions
  ) {
    return this.request<T, U>("PUT", path, {
      ...options,
      body: this.formatBody(body, options?.headers?.["Content-Type"]),
    });
  }

  async delete<T = unknown, U = unknown>(
    path: string,
    options?: RequestOptions
  ) {
    return this.request<T, U>("DELETE", path, options);
  }

  async patch<T = unknown, U = unknown>(
    path: string,
    body?: any,
    options?: RequestOptions
  ) {
    return this.request<T, U>("PATCH", path, {
      ...options,
      body: this.formatBody(body, options?.headers?.["Content-Type"]),
    });
  }

  // ボディのフォーマット処理
  private formatBody(body: any, contentType?: string): any {
    if (!body) return undefined;

    switch (contentType) {
      case "application/x-www-form-urlencoded":
        return new URLSearchParams(body).toString();
      case "multipart/form-data":
        const formData = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          formData.append(key, value as any);
        });
        return formData;
      default:
        return body;
    }
  }
}

export const apiClient = new APIClient({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_API_VERSION}`,
  timeout: 10000,
});
