import { NextResponse, type NextRequest } from "next/server";

import logger from "@/services/logger";

export const ErrorCode = {
  // リクエストの形式や入力値が不正な場合
  VALIDATION_ERROR: "VALIDATION_ERROR",
  // 指定したリソースが存在しない場合
  NOT_FOUND: "NOT_FOUND",
  // 認証が必要、または認証情報が不正な場合
  UNAUTHORIZED: "UNAUTHORIZED",
  // 認証済みだが操作する権限がない場合
  FORBIDDEN: "FORBIDDEN",
  // 一意制約や状態競合で処理を完了できない場合
  CONFLICT: "CONFLICT",
  // 想定外の例外などでサーバー側が失敗した場合
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface ApiErrorResponse {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

/**
 * # ApiResultError
 * SWR の error に乗せる API 共通エラーレスポンス
 *
 * ### 特徴
 * - ErrorCode でエラー種別を型安全に分岐できる
 * - API から返されたエラーレスポンスだけを表す
 */
export class ApiResultError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  public constructor(
    status: number,
    code: ErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiResultError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * ### isApiResultError
 * 捕捉したエラーが ApiResultError かどうかを判定する
 *
 * @param err - 判定対象
 * @returns ApiResultError の場合 true
 */
export function isApiResultError(err: unknown): err is ApiResultError {
  return err instanceof ApiResultError;
}

/**
 * # ApiError
 * API レスポンスとして返せる情報を持つ共通エラー
 *
 * ### 特徴
 * - HTTP ステータスと ErrorCode を一元管理する
 * - 想定内エラーかどうかをログレベル判定に使える
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;
  public readonly isExpected: boolean;

  public constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: unknown,
    isExpected = true,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isExpected = isExpected;
  }

  /**
   * ### toResponse
   * クライアントへ返すエラーレスポンスを生成する
   *
   * @returns API 共通エラーレスポンス
   */
  public toResponse(): ApiErrorResponse {
    return {
      code: this.code,
      message: this.message,
      ...(this.details !== undefined && { details: this.details }),
    };
  }
}

// ErrorCode ごとに受け取れる引数を固定して補完と型安全を両立する
// code に応じて必要な追加情報だけを渡せるようにして誤用を防ぐ
type ApiErrorArgs = {
  [ErrorCode.VALIDATION_ERROR]: [details?: unknown];
  [ErrorCode.NOT_FOUND]: [resource?: string];
  [ErrorCode.UNAUTHORIZED]: [];
  [ErrorCode.FORBIDDEN]: [];
  [ErrorCode.CONFLICT]: [message?: string];
  [ErrorCode.INTERNAL_SERVER_ERROR]: [message?: string];
};

type ApiErrorBuilderMap = {
  [K in ErrorCode]: (...args: ApiErrorArgs[K]) => ApiError;
};

// ErrorCode と ApiError の生成処理を 1 か所に集めて message や statusCode の揺れを防ぐ
// 追加の ErrorCode が増えてもここを見ればレスポンス方針を追えるようにする
const apiErrorBuilders: ApiErrorBuilderMap = {
  [ErrorCode.VALIDATION_ERROR]: (details?: unknown) =>
    new ApiError(
      400,
      ErrorCode.VALIDATION_ERROR,
      "Validation failed",
      details,
      true,
    ),
  [ErrorCode.NOT_FOUND]: (resource = "Resource") =>
    new ApiError(
      404,
      ErrorCode.NOT_FOUND,
      `${resource} not found`,
      undefined,
      true,
    ),
  [ErrorCode.UNAUTHORIZED]: () =>
    new ApiError(401, ErrorCode.UNAUTHORIZED, "Unauthorized", undefined, true),
  [ErrorCode.FORBIDDEN]: () =>
    new ApiError(403, ErrorCode.FORBIDDEN, "Forbidden", undefined, true),
  [ErrorCode.CONFLICT]: (message = "Conflict") =>
    new ApiError(409, ErrorCode.CONFLICT, message, undefined, true),
  [ErrorCode.INTERNAL_SERVER_ERROR]: (message = "Internal server error") =>
    new ApiError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      message,
      undefined,
      false,
    ),
};

/**
 * ### apiError
 * ErrorCode に対応した共通 API エラーを生成する
 *
 * @param code - エラー種別
 * @param args - ErrorCode ごとに定義された追加引数
 * @returns 共通 API エラー
 */
export function apiError<K extends ErrorCode>(
  code: K,
  ...args: ApiErrorArgs[K]
): ApiError {
  const builder = apiErrorBuilders[code];
  return builder(...args);
}

/**
 * ### apiErrorResponse
 * Route Handler で捕捉したエラーを共通 JSON レスポンスへ変換する
 *
 * @param err - 捕捉したエラー
 * @returns 共通 API エラーレスポンス
 */
export function apiErrorResponse(err: unknown): NextResponse<ApiErrorResponse> {
  if (err instanceof ApiError) {
    if (err.isExpected) {
      logger.warn(`ApiError: ${err.code} - ${err.message}`);
    } else {
      logger.error(`ApiError: ${err.code}`, err);
    }

    return NextResponse.json(err.toResponse(), { status: err.statusCode });
  }

  logger.error("Unexpected error", err);
  return NextResponse.json(
    {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    },
    { status: 500 },
  );
}

type ApiRouteContext = {
  params?: Promise<unknown>;
};

type ApiRouteHandler<Context extends ApiRouteContext = ApiRouteContext> = (
  request: NextRequest,
  context: Context,
) => Response | Promise<Response>;

/**
 * ### apiHandler
 * Route Handler 内で throw されたエラーを共通エラーレスポンスへ流す
 *
 * @param handler - Next.js の Route Handler
 * @returns エラー変換を含む Route Handler
 */
export function apiHandler<Context extends ApiRouteContext = ApiRouteContext>(
  handler: ApiRouteHandler<Context>,
): ApiRouteHandler<Context> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (err: unknown) {
      return apiErrorResponse(err);
    }
  };
}

/**
 * ### readJsonBody
 * JSON パース失敗もバリデーションエラーとして共通形式へ寄せる
 *
 * @param request - Next.js のリクエスト
 * @returns パース済み JSON
 */
export async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    const body: unknown = await request.json();
    return body;
  } catch {
    throw apiError(ErrorCode.VALIDATION_ERROR, {
      body: "Invalid JSON body",
    });
  }
}
