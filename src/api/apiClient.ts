import logger from "@/services/logger";
import { authStore } from "@/stores/authStore";
import { ApiErrorResponse, ApiResultError, ErrorCode } from "@/lib/apiError";
import { paths } from "@/types/v1/openapi";
import createClient from "openapi-fetch";
import type { ZodType } from "zod";

interface APIClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  useAuth?: boolean;
}

interface RequestOptions<TBody = unknown, TResponse = unknown> {
  body?: TBody;
  headers?: Record<string, string>;
  requestSchema?: ZodType<TBody>;
  responseSchema?: ZodType<TResponse>;
  skipAuth?: boolean;
  timeout?: number;
}

type ApiClientResult<T, U> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: U };

function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  if (data == null || typeof data !== "object") {
    return false;
  }

  const candidate = data as Partial<ApiErrorResponse>;
  return (
    typeof candidate.code === "string" &&
    Object.values(ErrorCode).includes(candidate.code) &&
    typeof candidate.message === "string"
  );
}

function createApiResultError(
  status: number,
  data: unknown,
  fallbackMessage: string,
) {
  if (isApiErrorResponse(data)) {
    return new ApiResultError(status, data.code, data.message, data.details);
  }

  return new ApiResultError(
    status,
    ErrorCode.INTERNAL_SERVER_ERROR,
    fallbackMessage,
    data,
  );
}

function normalizeUrlSegment(segment: string) {
  return segment.replace(/^\/+|\/+$/g, "");
}

function isAbsoluteUrl(path: string) {
  return /^https?:\/\//.test(path);
}

function buildApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION ?? "";

  if (!apiVersion) {
    return apiUrl.replace(/\/+$/g, "");
  }

  return `${apiUrl.replace(/\/+$/g, "")}/${normalizeUrlSegment(apiVersion)}`;
}

export class APIClient {
  private readonly config: Required<APIClientConfig>;
  private readonly client: ReturnType<typeof createClient<paths>>;

  constructor(config: APIClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      defaultHeaders: {
        "Content-Type": "application/json",
        ...config.defaultHeaders,
      },
      timeout: config.timeout ?? 5000,
      useAuth: config.useAuth ?? true,
    };

    this.client = createClient<paths>({
      baseUrl: this.config.baseUrl,
      headers: this.config.defaultHeaders,
    });
  }

  private getUserToken(): string | null {
    return authStore.getSnapshot().accessToken;
  }

  private buildHeaders(options?: RequestOptions) {
    const headers: Record<string, string> = {
      ...this.config.defaultHeaders,
      ...options?.headers,
    };

    // 認証付き API では毎回最新の token を store から読む
    if (this.config.useAuth && !options?.skipAuth) {
      const accessToken = this.getUserToken();

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return headers;
  }

  private getTimeout(options?: RequestOptions) {
    return options?.timeout ?? this.config.timeout;
  }

  private formatBody(
    body: unknown,
    contentType?: string,
    stringifyJson = false,
  ): unknown {
    if (body == null) {
      return undefined;
    }

    switch (contentType) {
      case "application/json":
        return stringifyJson ? JSON.stringify(body) : body;
      case "application/x-www-form-urlencoded":
        return new URLSearchParams(body as Record<string, string>).toString();
      case "multipart/form-data": {
        const formData = new FormData();

        Object.entries(body as Record<string, unknown>).forEach(
          ([key, value]) => {
            formData.append(key, value as string | Blob);
          },
        );

        return formData;
      }
      default:
        return body;
    }
  }

  private parseRequestBody<TBody>(
    body: TBody | undefined,
    options?: RequestOptions<TBody>,
    stringifyJson = false,
  ) {
    // 送信前に schema を通しておくことでサーバー側との不整合を減らす
    const validatedBody = options?.requestSchema
      ? options.requestSchema.parse(body)
      : body;

    return this.formatBody(
      validatedBody,
      options?.headers?.["Content-Type"] ??
        this.config.defaultHeaders["Content-Type"],
      stringifyJson,
    );
  }

  private parseResponseData<TResponse>(
    data: unknown,
    options?: RequestOptions<unknown, TResponse>,
  ) {
    // 外部 API や Route Handler の戻り値もここで共通検証する
    if (!options?.responseSchema) {
      return data as TResponse;
    }

    return options.responseSchema.parse(data);
  }

  private async withTimeout<T>(
    timeout: number,
    execute: (signal: AbortSignal) => Promise<T>,
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      return await execute(controller.signal);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private resolveUrl(pathOrUrl: string) {
    // 同一アプリ内の相対 path と外部 URL の両方を扱えるようにする
    if (!pathOrUrl) {
      return this.config.baseUrl;
    }

    if (isAbsoluteUrl(pathOrUrl)) {
      return pathOrUrl;
    }

    if (!this.config.baseUrl) {
      return pathOrUrl;
    }

    const normalizedBaseUrl = this.config.baseUrl.replace(/\/+$/g, "");
    const normalizedPath = pathOrUrl.replace(/^\/+/g, "");

    return normalizedPath
      ? `${normalizedBaseUrl}/${normalizedPath}`
      : normalizedBaseUrl;
  }

  private async parseFetchResponse(response: Response) {
    if (response.status === 204) {
      return undefined;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      return response.json().catch(() => undefined);
    }

    return response.text().catch(() => undefined);
  }

  private handleUnexpectedError(
    error: unknown,
    method: string,
    path: string,
    timeout: number,
  ): never {
    logger.error(`API Request Failed: ${method} ${path}`, error);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }

    throw new Error("Network error: unknown error");
  }

  private async request<T = unknown, U = unknown, TBody = unknown>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    path: string,
    options?: RequestOptions<TBody, T>,
  ): Promise<ApiClientResult<T, U>> {
    const timeout = this.getTimeout(options);
    const headers = this.buildHeaders(options);

    try {
      logger.debug(`== API Request ==\n${method} ${path}`, { headers });

      // openapi-fetch 用の経路は既存の型付き client をそのまま使う
      const response = (await this.withTimeout(timeout, (signal) =>
        (this.client[method] as any)(path, {
          ...(options?.body !== undefined && {
            body: this.parseRequestBody(options.body, {
              ...options,
              headers,
            }),
          }),
          headers,
          signal,
        }),
      )) as {
        data?: unknown;
        error?: U;
        response: {
          status: number;
        };
      };

      if (response.error) {
        logger.warn(`API Error: ${method} ${path}`, {
          error: response.error,
          status: response.response.status,
        });

        throw createApiResultError(
          response.response.status,
          response.error,
          `API Error: ${response.response.status}`,
        );
      }

      logger.debug(`API Success: ${method} ${path}`);

      return {
        data: this.parseResponseData(response.data, options),
      };
    } catch (error) {
      if (error instanceof ApiResultError) {
        throw error;
      }

      this.handleUnexpectedError(error, method, path, timeout);
    }
  }

  private async requestUrl<T = unknown, U = unknown, TBody = unknown>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    pathOrUrl: string,
    options?: RequestOptions<TBody, T>,
  ): Promise<ApiClientResult<T, U>> {
    const timeout = this.getTimeout(options);
    const headers = this.buildHeaders(options);
    const url = this.resolveUrl(pathOrUrl);

    try {
      logger.debug(`== External API Request ==\n${method} ${url}`, { headers });

      // 外部 API は fetch ベースで呼びつつ request と response の検証は共通化する
      const response = await this.withTimeout(timeout, (signal) =>
        fetch(url, {
          body:
            options?.body !== undefined
              ? (this.parseRequestBody(
                  options.body,
                  {
                    ...options,
                    headers,
                  },
                  true,
                ) as BodyInit | null | undefined)
              : undefined,
          headers,
          method,
          signal,
        }),
      );

      const responseData = await this.parseFetchResponse(response);

      if (!response.ok) {
        logger.warn(`External API Error: ${method} ${url}`, {
          data: responseData,
          status: response.status,
        });

        throw createApiResultError(
          response.status,
          responseData,
          `API Error: ${response.status}`,
        );
      }

      logger.debug(`External API Success: ${method} ${url}`);

      return {
        data: this.parseResponseData(responseData, options),
      };
    } catch (error) {
      if (error instanceof ApiResultError) {
        throw error;
      }

      this.handleUnexpectedError(error, method, url, timeout);
    }
  }

  async get<T = unknown, U = unknown>(
    path: string,
    options?: RequestOptions<never, T>,
  ) {
    return this.request<T, U>("GET", path, options);
  }

  async post<T = unknown, U = unknown, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions<TBody, T>,
  ) {
    return this.request<T, U, TBody>("POST", path, {
      ...options,
      body,
    });
  }

  async put<T = unknown, U = unknown, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions<TBody, T>,
  ) {
    return this.request<T, U, TBody>("PUT", path, {
      ...options,
      body,
    });
  }

  async delete<T = unknown, U = unknown>(
    path: string,
    options?: RequestOptions<never, T>,
  ) {
    return this.request<T, U>("DELETE", path, options);
  }

  async patch<T = unknown, U = unknown, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions<TBody, T>,
  ) {
    return this.request<T, U, TBody>("PATCH", path, {
      ...options,
      body,
    });
  }

  async getUrl<T = unknown, U = unknown>(
    pathOrUrl: string,
    options?: RequestOptions<never, T>,
  ) {
    return this.requestUrl<T, U>("GET", pathOrUrl, options);
  }

  async postUrl<T = unknown, U = unknown, TBody = unknown>(
    pathOrUrl: string,
    body?: TBody,
    options?: RequestOptions<TBody, T>,
  ) {
    return this.requestUrl<T, U, TBody>("POST", pathOrUrl, {
      ...options,
      body,
    });
  }

  async putUrl<T = unknown, U = unknown, TBody = unknown>(
    pathOrUrl: string,
    body?: TBody,
    options?: RequestOptions<TBody, T>,
  ) {
    return this.requestUrl<T, U, TBody>("PUT", pathOrUrl, {
      ...options,
      body,
    });
  }

  async deleteUrl<T = unknown, U = unknown>(
    pathOrUrl: string,
    options?: RequestOptions<never, T>,
  ) {
    return this.requestUrl<T, U>("DELETE", pathOrUrl, options);
  }

  async patchUrl<T = unknown, U = unknown, TBody = unknown>(
    pathOrUrl: string,
    body?: TBody,
    options?: RequestOptions<TBody, T>,
  ) {
    return this.requestUrl<T, U, TBody>("PATCH", pathOrUrl, {
      ...options,
      body,
    });
  }
}

export function createApiClient(config: APIClientConfig) {
  return new APIClient(config);
}

export const apiClient = new APIClient({
  baseUrl: buildApiBaseUrl(),
  timeout: 10000,
});
