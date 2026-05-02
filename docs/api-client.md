# API クライアントと SWR エラー処理

フロント側では、API が返した共通エラーだけを `ApiResultError` として扱う。ネットワークエラー、タイムアウト、フロント側の予期しない例外は通常の `Error` のまま扱う

## 基本方針

- API が `ErrorResponse` を返した場合は `ApiResultError` を throw する
- 通信不能やタイムアウトは通常の `Error` を throw する
- SWR の `error` には fetcher / mutation fetcher が throw した値をそのまま乗せる
- mutation は `ApiResult<T>` のような独自戻り値にせず、SWR Mutation の `trigger()` と同じく成功時は `T`、失敗時は reject にする

## ApiResultError

`ApiResultError` は API が返した共通エラーレスポンスを表す

```ts
class ApiResultError extends Error {
  status: number;
  code: ErrorCode;
  details?: unknown;
}
```

API エラーかどうかを判定したい場合は `isApiResultError(error)` を使う

```ts
if (isApiResultError(error)) {
  if (error.code === ErrorCode.NOT_FOUND) {
    // API が返した 404
  }
}
```

## apiClient

`apiClient` は HTTP エラーを次のように扱う

- レスポンス body が `ApiErrorResponse` の場合は `ApiResultError` を throw する
- レスポンス body が共通形式ではない場合は `INTERNAL_SERVER_ERROR` の `ApiResultError` を throw し、元 body を `details` に入れる
- ネットワークエラーや timeout は通常の `Error` を throw する

これにより、API が返した業務エラーと、通信や実行環境のエラーを区別できる

## GET hooks

GET 系 hook は SWR の `error` に `ApiResultError | Error` が入る前提で型付けする

```ts
const swr = useSWR<User[], ApiResultError | Error>(
  usersListKey(authVersion),
  () => getUsersRequest(),
);

return {
  ...swr,
  users: swr.data ?? [],
  error: swr.error,
};
```

request 関数では `apiClient` をそのまま呼ぶ。`try/catch` で独自変換しない

```ts
async function getUsersRequest(): Promise<User[]> {
  const res = await apiClient.get<User[]>("/users");
  return res.data ?? [];
}
```

## Mutation hooks

mutation hook は SWR Mutation の標準に寄せる。成功時は作成・更新・削除した値を返し、失敗時は `trigger()` の reject をそのまま流す

```ts
const mutation = useSWRMutation<
  User,
  ApiResultError | Error,
  ReturnType<typeof addUserKey>,
  UserRequest
>(addUserKey(authVersion), async (_key, { arg }) => addUserRequest(arg));

const addUser = async (user: UserRequest): Promise<User> => {
  const createdUser = await mutation.trigger(user);

  await mutate(
    usersListKey(authVersion),
    (currentUsers: User[] = []) => [...currentUsers, createdUser],
    { revalidate: false },
  );

  return createdUser;
};
```

呼び出し側は、即時に通知したい場合だけ `try/catch` する

```ts
try {
  await addUser(input);
} catch (error) {
  if (isApiResultError(error)) {
    // API が返した ErrorCode で分岐できる
  }
}
```

画面の状態としては hook の `error` を見る

```ts
const { addUser, error, isMutating } = useAddUser();
```

## エラー表示

コンポーネントでは `ApiResultError` と通常の `Error` を分けて扱う

```ts
function getErrorMessage(error: unknown) {
  if (isApiResultError(error)) {
    switch (error.code) {
      case ErrorCode.VALIDATION_ERROR:
        return "入力内容を確認してください";
      case ErrorCode.NOT_FOUND:
        return "対象が見つかりません";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "エラーが発生しました";
}
```

`src/app/swr/page.tsx` はこの方針のデモになっている。API 共通エラーでは `code` / `status` / `details` を表示し、通常の `Error` はリクエストエラーとして表示する

## 使い分け

| 種別 | throw される型 | 主な扱い |
| :-- | :-- | :-- |
| API の 400 / 404 / 500 など | `ApiResultError` | `ErrorCode` で分岐する |
| API 以外の通信失敗 | `Error` | 一般的な通信エラーとして扱う |
| timeout | `Error` | retry や再読み込みを促す |
| フロント側の予期しない例外 | `Error` | 通常の例外として扱う |
