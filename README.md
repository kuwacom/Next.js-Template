# Next.js Template

Next.js 16 / React 19 / TypeScript 5 をベースにした Web アプリ用テンプレートです

UI には shadcn/ui と Tailwind CSS v4 を採用し、API 層は `apiClient`・`authStore`・`useSWR` / `useSWRMutation` を組み合わせた構成になっています

themeシステムも組み込まれています

## ブランチ構成

このリポジトリでは、`main` をベースに用途ごとの拡張をブランチ単位で管理しています

| ブランチ | 追加される構成 | こんなときに向いています |
| --- | --- | --- |
| `main` | 認証 UI、SWR ベースの API クライアント、OpenAPI 型生成、テーマ切り替え、Cloudflare Turnstile + Discord フォーム | Next.js のベーステンプレートから機能を選んで拡張したいとき |
| `feature/mdx` | `content/docs/` と `@next/mdx` を使ったドキュメント / ブログ構成 | App Router 上でシンプルに MDX 記事を配信したいとき |
| `feature/mdx-i18n` | `next-intl` による多言語ルーティングと、ロケール対応した MDX / フォーム構成 | 日本語 / 英語など複数言語に対応したサイトを始めたいとき |
| `feature/mdx-velite` | `content/docs/` と `velite` を使ったビルド時コンテンツ生成構成 | MDX を型安全に管理しつつ静的コンテンツを運用したいとき |

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
DESIGN.md                     AI及び人間用のデザイン指示md
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

## Cloudflare へのデプロイについて

| 用途 | 主流の方法 | 詳細 |
| --- | --- | --- |
| SSR / Route Handlers / Middleware / Server Actions / ISR が必要 | `@opennextjs/cloudflare` + **Workers** | フルスタック Next.js の第一候補 |
| SSR / API Routes を **dashboard の Git 連携中心** で運用したい | `@opennextjs/cloudflare` + **Workers Builds** | 実体は Workers。classic Pages ではなく Git 連携付き Workers 運用 |
| 静的配信のみでよい | `output: "export"` + **Pages** | アダプタ不要。`next build` のみ |

このテンプレートの初期状態は `src/app/api/**/route.ts` と `src/proxy.ts` を含むため、何も削らずに載せるなら `Workers` 系が向いています

### 1. SSR / API Routes ありで Workers にデプロイする場合

フルスタックNext.jsのベストプラクティスは、`@opennextjs/cloudflare` を使ってWorkersに載せることです

#### ベストプラクティス

- 既存プロジェクトはまず `npx @opennextjs/cloudflare migrate` で初期変換する
- `wrangler` ではなく、以後は `opennextjs-cloudflare` CLI を普段使いする
- `package.json` の `build` は **素の `next build`** にしておく
- `next.config.ts` に `initOpenNextCloudflareForDev()` を入れて、`next dev` 中も binding を扱えるようにする
- `.dev.vars` を置き、少なくとも `NEXTJS_ENV=development` とローカル用 env を入れる
- `npm run preview` で **Workers runtime** 上のローカル挙動を確認してから deploy する
- `wrangler.jsonc` は repo に commit し、binding や互換設定の source of truth にする
- `compatibility_flags` には `nodejs_compat` を必ず入れる
- 外部 URL への fetch を使うなら `global_fetch_strictly_public` も入れる
- `compatibility_date` は **デプロイ日基準の新しい日付** を使う
- `public/_headers` を追加し、`/_next/static/*` に長期 cache header を付ける
- ISR / `revalidate` / `use cache` を使うなら R2 に `NEXT_INC_CACHE_R2_BUCKET` を binding する
- `export const runtime = "edge";` は使わない。現行の Cloudflare adapter は edge runtime を前提にしない
- このテンプレートのようにフロントから同一アプリの Route Handler を呼ぶなら、`NEXT_PUBLIC_API_URL=/api` にそろえる

#### 最低限のセットアップ

手動に該当する設定を自動でやってくれます

```bash
npx @opennextjs/cloudflare migrate
```

手動セットアップにする場合は、少なくとも以下をそろえます

```bash
npm install @opennextjs/cloudflare@latest
npm install --save-dev wrangler@latest
```

`package.json` の推奨 script 例

```json
{
  "scripts": {
    "build": "next build",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
  }
}
```

`wrangler.jsonc` の最小例

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "next-js-template",
  "main": ".open-next/worker.js",
  // デプロイ時点の新しい日付に更新してください
  "compatibility_date": "2026-04-13",
  "compatibility_flags": [
    "nodejs_compat",
    "global_fetch_strictly_public"
  ],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "services": [
    {
      "binding": "WORKER_SELF_REFERENCE",
      "service": "next-js-template"
    }
  ],
  "images": {
    "binding": "IMAGES"
  }
}
```

`next.config.ts` の例

```ts
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

initOpenNextCloudflareForDev();
```

`public/_headers` の最低限

```text
/_next/static/*
  Cache-Control: public,max-age=31536000,immutable
```

#### このテンプレートでの注意

- `NEXT_PUBLIC_API_URL` は `http://localhost:3000/api` のままではなく、Workers では `/api` に変える
- テスト用APIデータストアの `src/services/UserService.ts` はインメモリ配列なので、本番運用では D1 / KV / 外部 DB などへ置き換える
- OpenNext 導入後は `npm run preview` と `npm run deploy` を主導線にする

`.dev.vars` の最小例

```env
NEXTJS_ENV=development
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_API_VERSION=v1
LOG_LEVEL=3
```

### 2. SSR / API Routes ありで dashboard の Git 連携中心に運用する場合

使う adapter は 1 と同じ `@opennextjs/cloudflare` です

#### ベストプラクティス

- ローカルで `migrate` 済みの設定を commit してから接続する
- まだ設定が無い repo を接続する場合は、Workers Builds の **autoconfig PR** を merge する
- build command は `npx @opennextjs/cloudflare build`
- deploy command は `npx @opennextjs/cloudflare deploy`
- gradual deployments を使いたい場合は deploy command を `npx @opennextjs/cloudflare upload` にする
- `Build Variables and secrets` に `NEXT_PUBLIC_*` だけでなく、build に必要な非公開 env も入れる
- dashboard 上の Worker 名と `wrangler.jsonc` の `name` を一致させる
- preview URL を活かすために non-production branch builds を有効にする
- monorepo の場合は Build watch paths を設定して不要な build を減らす

#### dashboard 側の流れ

1. Workers & Pages で `Create application`
2. `Import a repository` を選ぶ
3. 対象 repo を接続する
4. Build command を `npx @opennextjs/cloudflare build` にする
5. Deploy command を `npx @opennextjs/cloudflare deploy` にする
6. `Build Variables and secrets` に必要な env を登録する
7. 必要なら branch preview を有効化する

#### 補足

- repo 側に設定が無いまま接続すると、Workers Builds は内部で `npx wrangler deploy` を使って autoconfig し、PR を作ることがあります
- その PR を merge しないと、以後の build でも毎回 autoconfig が走り、**二度 build されて遅くなりやすい**です
- そのため、最終的には `wrangler.jsonc` や script を repo に持つ運用が推奨です

### 3. 静的のみで Cloudflare Pages にデプロイする場合

静的配信だけで成立するなら、`output: "export"` を使って **Pages** に置くのが最もシンプルです
この場合は adapter は不要で、`next build` のみで十分です

Cloudflare 公式も、**static export に限定する場合のみ** Pages ガイドを使うよう案内しています

#### ベストプラクティス

- `next.config.ts` に `output: "export"` を入れる
- App Router でも **ビルド時に確定できるものだけ** を使う
- SSR / Proxy / Middleware / ISR / Server Actions / dynamic request ベースの Route Handler は使わない
- `rewrites` / `redirects` / `headers` は使わない
- `next/image` を使うなら custom loader か `images.unoptimized` を使う
- フロントが呼ぶ API は外部 API か別 Worker に切り出す
- `NEXT_PUBLIC_*` の値は build 時に埋め込まれる前提で管理する

#### 参考設定

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // next/image を使う場合
  // images: { unoptimized: true },
};

export default nextConfig;
```

```env
NEXT_PUBLIC_API_URL=https://api.example.com/api
NEXT_PUBLIC_API_VERSION=v1
LOG_LEVEL=3
```

#### dashboard 側の設定

1. Workers & Pages から `Pages` を作成
2. Git リポジトリを接続
3. Framework preset に `Next.js (Static HTML Export)` を選択
4. Build command を `npx next build` にする
5. Build directory を `out` にする
6. `Build Variables and secrets` に `NEXT_PUBLIC_*` を登録する

#### このテンプレートで必要な整理

- `src/app/api/**/route.ts` は削除するか別 API に移す
- `src/proxy.ts` は削除する
- 現在の CRUD デモ API は static export にはそのまま載らない
- App Router の `GET` Route Handler でも、Request に依存するものは static export できない

### 補足: Pages + Pages Functions を使う場合

「フロントは静的 Pages に置きたいが、軽い API やフォーム処理だけ同じプロジェクトで持ちたい」なら、**`output: "export"` + Pages Functions** も有力です
ただしこれは **フルスタック Next.js をそのまま載せる方法ではなく**、`src/app/api/**/route.ts` を root の `/functions` に書き直す構成です

#### ベストプラクティス

- フロントは `out/` に static export する
- Functions は `out/` ではなく **プロジェクトルート直下の `/functions`** に置く
- API ベース URL は same-origin の `/api` に寄せる
- secret や binding は Pages project の `Variables and Secrets` / `Bindings` で管理する
- Pages Functions を使う場合、デプロイは Git 連携か `wrangler` 経由にする。direct upload は使えない
- 小さな CRUD、Webhook、フォーム送信、薄い proxy 用途に限定する
- SSR や App Router のサーバー機能を残したい場合はこの方法を選ばない

最小例

```ts
// functions/api/v1/health.ts
export const onRequestGet: PagesFunction = async () => {
  return Response.json({ ok: true });
};
```

### 参考Docs

- Cloudflare Pages: Next.js
  https://developers.cloudflare.com/pages/framework-guides/nextjs/
- Cloudflare Pages: Static Next.js site
  https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
- Cloudflare Pages Functions: Get started
  https://developers.cloudflare.com/pages/functions/get-started/
- Cloudflare Workers: Next.js guide
  https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- Cloudflare Workers Builds
  https://developers.cloudflare.com/workers/ci-cd/builds/
- Cloudflare Workers Builds: Automatic PRs
  https://developers.cloudflare.com/workers/ci-cd/builds/automatic-prs/
- OpenNext for Cloudflare: Get Started
  https://opennext.js.org/cloudflare/get-started
- OpenNext for Cloudflare: CLI
  https://opennext.js.org/cloudflare/cli
- OpenNext for Cloudflare: Dev Deploy / Workers Builds
  https://opennext.js.org/cloudflare/howtos/dev-deploy
- Next.js: Static Exports
  https://nextjs.org/docs/app/guides/static-exports

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
