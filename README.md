# Next.js Template

このプロジェクトは、Next.js をベースとしたモダンなウェブアプリケーションのテンプレートです  
shadcn/ui コンポーネント、Tailwind CSS、ダークモード対応、TypeScript を使用して構築しています

このReadmeはある程度適当に書いているため、適度に更新する必要あり。

## 特徴

- **Next.js 15**: 最新の Next.js を使用した高速な React アプリケーション
- **TypeScript**: 型安全性を確保した開発環境
- **Tailwind CSS**: ユーティリティファーストの CSS フレームワークで、レスポンシブデザインを簡単に実現
- **shadcn/ui**: 高品質な UI コンポーネントライブラリ（Button, Card, Badge, Input, Tabs など）
- **ダークモード**: next-themes を使用したライト/ダーク/システムテーマの切り替え
- **アニメーション**: Framer Motion と GSAP を使用したスムーズなアニメーション
- **ESLint**: コード品質を維持するためのリンター設定
- **Turbopack**: 高速なビルドと開発サーバー

## インストール

このプロジェクトをクローンまたはダウンロードして、ローカル環境で実行してください

1. 依存関係をインストールします：
   ```bash
   npm install
   ```

2. 開発サーバーを起動します：
   ```bash
   npm run dev
   ```

   ブラウザで `http://localhost:3000` を開いてください

## 使用方法

### スクリプト

- `npm run dev`: 開発サーバーを起動（Turbopack 使用）
- `npm run build`: プロダクションビルドを作成（Turbopack 使用）
- `npm run start`: プロダクションビルドを起動
- `npm run lint`: ESLint を実行してコードをチェック

### プロジェクト構造

- `src/app/`: Next.js App Router のページとレイアウト
- `src/components/`: UI コンポーネント（shadcn/ui ベース）
- `src/lib/`: ユーティリティ関数
- `public/`: 静的アセット（アイコンなど）

### テーマの切り替え

ヘッダーのボタンを使用して、ライトモード、ダークモード、またはシステム設定に切り替えられます。`ThemeProvider` が `next-themes` を使用してテーマを管理します

### UI コンポーネントのデモ

メインページ（`src/app/page.tsx`）には、shadcn/ui コンポーネントのデモが含まれています：
- Button: さまざまなバリエーション（Default, Secondary, Outline, Ghost, Destructive）
- Input: ラベル付きの入力フィールド
- Badge: ステータス表示用のバッジ
- Tabs: タブ付きコンテンツ

## 技術スタック

- **Framework**: Next.js 15.5.6
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI ベース)
- **Theme Management**: next-themes
- **Animations**: Framer Motion, GSAP
- **Icons**: Lucide React
- **Linting**: ESLint 9

## カスタマイズ

- `tailwind.config.ts`: Tailwind の設定をカスタマイズ
- `src/app/globals.css`: グローバルスタイルと CSS カスタムプロパティ
- `components.json`: shadcn/ui の設定

新しいコンポーネントを追加するには、shadcn/ui の CLI を使用してください：
```bash
npx shadcn@latest add [component-name]
```
