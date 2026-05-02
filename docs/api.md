# API エラーシステム

Next.js の Route Handler で返すエラーレスポンスは、`src/lib/apiError.ts` の `ErrorCode` / `ApiErrorResponse` / `ApiError` に統一する

## エラーレスポンス

API のエラー JSON は次の形式に揃える

```ts
type ValidationErrorDetails = ZodIssue[];

type ApiErrorResponse =
  | {
      code: typeof ErrorCode.VALIDATION_ERROR;
      message: string;
      details: ValidationErrorDetails;
    }
  | {
      code: Exclude<ErrorCode, typeof ErrorCode.VALIDATION_ERROR>;
      message: string;
    };
```

`details` は `VALIDATION_ERROR` の場合だけ付ける。その他のエラーでは `details` を返さない

`ErrorCode` はバックエンドと同じ固定値を使う

```ts
ErrorCode.VALIDATION_ERROR
ErrorCode.NOT_FOUND
ErrorCode.UNAUTHORIZED
ErrorCode.FORBIDDEN
ErrorCode.CONFLICT
ErrorCode.INTERNAL_SERVER_ERROR
```

## Route Handler

Next.js App Router には Express のような最後尾の error middleware がないため、Route Handler は `apiHandler` で包む

```ts
export const GET = apiHandler(async () => {
  return NextResponse.json(users);
});
```

handler 内では、API として返したいエラーだけ `apiError(...)` を throw する

```ts
if (!user) {
  throw apiError(ErrorCode.NOT_FOUND, "User");
}
```

バリデーションは Zod の `safeParse` を使い、失敗時は `details` に `validation.error.issues` を入れる

```ts
const validation = userRequestSchema.safeParse(body);

if (!validation.success) {
  throw apiError(ErrorCode.VALIDATION_ERROR, validation.error.issues);
}
```

JSON body の読み取りは `readJsonBody(request)` を使う。JSON parse に失敗した場合も `VALIDATION_ERROR` として返し、`details` には Zod issue と同じ形の `custom` issue を入れる

## apiHandler の責務

`apiHandler` は Route Handler 内で throw された値を捕捉する

- `ApiError` の場合は `statusCode` と `toResponse()` で JSON を返す
- `isExpected=true` は warn ログにする
- `isExpected=false` は error ログにする
- それ以外の例外は 500 の `INTERNAL_SERVER_ERROR` として返す

## 実装例

```ts
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await readJsonBody(request);
  const validation = userRequestSchema.safeParse(body);

  if (!validation.success) {
    throw apiError(ErrorCode.VALIDATION_ERROR, validation.error.issues);
  }

  const user = createUser(validation.data);
  return NextResponse.json(user, { status: 201 });
});
```

## OpenAPI

`openapi/v1.yaml` の `ApiErrorResponse` は `VALIDATION_ERROR` とその他の `ErrorResponse` を `oneOf` で分ける

```yaml
ApiErrorResponse:
  oneOf:
    - $ref: '#/components/schemas/ValidationErrorResponse'
    - $ref: '#/components/schemas/ErrorResponse'
ValidationErrorResponse:
  type: object
  properties:
    code:
      type: string
      enum:
        - VALIDATION_ERROR
    message:
      type: string
    details:
      type: array
      items:
        $ref: '#/components/schemas/ZodIssue'
  required:
    - code
    - message
    - details
ErrorResponse:
  type: object
  properties:
    code:
      type: string
      enum:
        - NOT_FOUND
        - UNAUTHORIZED
        - FORBIDDEN
        - CONFLICT
        - INTERNAL_SERVER_ERROR
    message:
      type: string
  required:
    - code
    - message
```
