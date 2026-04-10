# Next.js Template

Next.js 16 / React 19 / TypeScript 5 をベースにした Web アプリ用テンプレートです

UI には shadcn/ui と Tailwind CSS v4 を採用し、API 層は `apiClient`・`authStore`・`useSWR` / `useSWRMutation` を組み合わせた構成になっています

themeシステムも組み込まれています

## 特徴

- **Next.js 16 + React 19**
- **App Router** ベースのフロントエンド実装
- **`/api/v1` 構成** の Route Handler 実装
- **OpenAPI + 型生成** による API 型管理
- **`authStore` + `useAuth`** による認証状態管理
- **SWR / SWRMutation** を使ったエンドポイント単位の hook 構成
- **shadcn/ui + Tailwind CSS v4** による UI 実装
- **next-themes** によるライト / ダーク / システムテーマ切り替え
- **`content/docs/` + `@next/mdx`** による記事システム
- **`src/proxy.ts`** による API 向け CORS サンプル実装

## セットアップ

1. 依存関係をインストール

   ```bash
   npm install
   ```

2. 環境変数を用意

   ```bash
   copy example.env .env
   ```

3. 開発サーバーを起動

   ```bash
   npm run dev
   ```

4. ブラウザで `http://localhost:3000` を開く

## スクリプト

- `npm run dev` 開発サーバーを起動
- `npm run build` 本番ビルドを作成
- `npm run start` 本番ビルドを起動
- `npm run lint` ESLint を実行
- `npm run generate-types` `openapi/v1.yaml` から `src/types/v1/openapi.d.ts` を生成

## 環境変数

`example.env` の内容

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_VERSION=v1
LOG_LEVEL=3
```

- `NEXT_PUBLIC_API_URL` API のベース URL
- `NEXT_PUBLIC_API_VERSION` API バージョン
- `LOG_LEVEL` `tslog` のログレベル

最終的な API ベース URL は

```text
${NEXT_PUBLIC_API_URL}/${NEXT_PUBLIC_API_VERSION}
```

として組み立てられます

## ディレクトリ構成

```text
src/
├─ app/
│  ├─ api/v1/users/           Route Handler
│  ├─ docs/                   `/docs/*` 配下のルート
│  ├─ page.tsx                UI コンポーネントのデモ
│  └─ swr/page.tsx            SWR CRUD デモ
├─ api/
│  ├─ apiClient.ts            共通 API クライアント
│  ├─ fetcher.ts              共通 fetcher
│  └─ v1/users/               users エンドポイント用 hooks
├─ components/                UI / Provider 群
├─ hooks/
│  └─ useAuth.ts              authStore の React 向け窓口
├─ stores/
│  └─ authStore.ts            認証状態の外部ストア
├─ services/
│  ├─ logger.ts               tslog 設定
│  └─ UserService.ts          サンプルデータ
└─ types/v1/
   ├─ api.ts                  API 用の利用型
   └─ openapi.d.ts            OpenAPI 生成型

openapi/
└─ v1.yaml                    OpenAPI 定義

content/docs/
├─ getting-started.mdx        MDX 記事サンプル
└─ guides/
   ├─ index.mdx               フォルダ index サンプル
   └─ writing-docs.mdx        ネスト記事サンプル

mdx-components.tsx            MDX 共通コンポーネント定義
```

## MDX 記事システム

- 記事ファイルは `content/docs/` に配置します
- URL は `/docs/*` にルーティングされます
  - `content/docs/getting-started.mdx` → `/docs/getting-started`
  - `content/docs/guides/index.mdx` → `/docs/guides`
  - `content/docs/guides/writing-docs.mdx` → `/docs/guides/writing-docs`
- 各フォルダに `index.mdx` を置くと、そのフォルダ自身の URL をトップページとして使えます
- `.mdx` は `@next/mdx` によって Next.js のビルド時にコンパイルされます
- 各記事の先頭で `metadata` を export してください

```mdx
export const metadata = {
  title: "記事タイトル",
  description: "一覧とメタタグに使う説明文",
  publishedAt: "2026-03-14",
  tags: ["MDX", "Docs"],
  draft: false,
}

# 見出し
```

- `draft: true` にすると一覧表示と公開ルートから除外されます
- グローバル MDX コンポーネントは `mdx-components.tsx` で追加できます

### MDX プラグイン

- `remark-gfm` GitHub Flavored Markdown
- `remark-math` + `rehype-katex` TeX 数式
- `@mapbox/rehype-prism` コードブロックのシンタックスハイライト
- `rehype-slug` 見出しに id を付与
- `remark-toc` 目次の生成
- `remark-breaks` 改行の反映

## API 層の構成

このテンプレートに組み込んである実装例です

### 1. 共通クライアント

- `src/api/apiClient.ts`
- `authStore` から最新 token を取得してリクエストに付与
- `openapi-fetch` を使って型付きで API を呼び出す

### 2. 認証状態

- `src/stores/authStore.ts`
  - 認証状態の本体
  - token と `authVersion` を保持
- `src/hooks/useAuth.ts`
  - `authStore` を React から扱うための hook

`useAuth` 経由で token を更新すると、`authVersion` が進みます

### 3. SWR hooks

エンドポイントごとに hook を分割しています

- `src/api/v1/users/useUsers.ts`
- `src/api/v1/users/useUser.ts`
- `src/api/v1/users/useAddUser.ts`
- `src/api/v1/users/useUpdateUser.ts`
- `src/api/v1/users/useDeleteUser.ts`

GET 系は `useSWR`、更新系は `useSWRMutation` を使います

各 hook は SWR key に `authVersion` を含めるため、認証状態が変わると対象データが自動再評価されます

## users エンドポイントの使い方

### 一覧取得

```tsx
const { users, isLoading, error, mutate } = useUsers()
```

### 単体取得

```tsx
const { user, isLoading, error } = useUser(userId)
```

### 追加

```tsx
const { addUser, isMutating } = useAddUser()

await addUser({
  name: "Alice",
  email: "alice@example.com",
})
```

### 更新

```tsx
const { updateUser, isMutating } = useUpdateUser()

await updateUser({
  userId: "1",
  user: {
    name: "Updated Name",
    email: "updated@example.com",
  },
})
```

### 削除

```tsx
const { deleteUser, isMutating } = useDeleteUser()

await deleteUser("1")
```

`updateUserRequest` は例外的な直接利用用に残していますが、React コンポーネントからは `useUpdateUser` を優先して使う想定です

## OpenAPI と型生成

OpenAPI 定義は `openapi/v1.yaml` にあります

定義を更新したら次を実行します

```bash
npm run generate-types
```

生成先

- `src/types/v1/openapi.d.ts`

利用側の型は `src/types/v1/api.ts` にまとめています

## UI / デモページ

- `src/app/page.tsx`
  - shadcn/ui コンポーネントの基本デモ
- `src/app/swr/page.tsx`
  - users API を使った CRUD デモ

## テーマ

- `src/components/providers/ThemeProvider.tsx`
- `src/components/Headers/ExampleHeader.tsx`

ヘッダーからライト / ダーク / システムテーマを切り替えできます

## CORS サンプル

- `src/proxy.ts`

`/api/:path*` に対して CORS ヘッダーを付与するサンプルです

本番利用時は `allowedOrigins` を実運用向けに必ず調整してください

## 補足

- `@gsap/react` と `gsap` は依存として入っていますが、現状のサンプルでは主要機能としては使っていません
- `src/services/UserService.ts` はインメモリのサンプルデータです
- 実運用では DB や外部 API に置き換える想定です
