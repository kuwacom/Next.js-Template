# Design System

## Overview
このテンプレートは、shadcn/ui と Tailwind をベースにした、ニュートラルでトークン主導の UI です。
ブランドを強く出すランディングページ用ではなく、再利用しやすいアプリ基盤として設計されています。

このテンプレートの見た目の方向性は以下です。
- 実用的でノイズが少ない
- ライト / ダークで同じ構造を維持する
- slate 系のやわらかい面構成を使う
- アニメーションは控えめにする
- 階層は強い色ではなく、余白・境界線・面のコントラストで作る

## Source of Truth
- テーマトークンの定義は `src/app/globals.css`
- Tailwind 側の色と角丸のエイリアスは `tailwind.config.ts`
- アプリ全体のレイアウト基準は `src/app/layout.tsx`

UI を拡張するときは、まず semantic token を変更することを優先します。
コンポーネントごとに単発の色をばらまいて解決しないでください。

## Theme Model
- `background` `foreground` `card` `primary` `secondary` `muted` `accent` `border` `input` `ring` `destructive` などの semantic token を使う
- `bg-background` `text-foreground` `border-border` `bg-card` `text-muted-foreground` のようなトークン由来の Tailwind utility を優先する
- 可能な限り、ライト / ダークでコンポーネント構造を分けない
- テーマ切り替えは `dark` クラスで行い、テーマごとに別実装を作らない

重要:
このテンプレートの `primary` は、鮮やかなブランドカラーではありません。
テーマに応じて反転する、高コントラストな基準色として扱います。

- ライトモード: 濃いインクのような `primary`
- ダークモード: 明るい反転面としての `primary`

つまり、標準状態の見た目は意図的にモノトーン寄りです。
あとからブランドカラーを入れる場合も、既存ルールを迂回せず token として追加してください。

## Colors
- **Background**: ページの基本面
- **Foreground**: 標準テキスト
- **Card / Popover**: ページ本体より少しだけ浮く面
- **Primary**: 最優先アクションや強調
- **Secondary / Accent / Muted**: 補助 UI と状態表現
- **Border / Input / Ring**: 構造、入力境界、フォーカス表現
- **Destructive**: エラー、破壊的操作、無効状態の警告

色の使い方:
- `primary` はその領域の最重要アクションに限定して使う
- 補助的な UI には `secondary` `muted` `accent` を使う
- `text-muted-foreground` は補足情報専用にし、重要情報には使わない
- `bg-slate-800` や `text-zinc-500` のようなパレット直指定より semantic class を優先する
- token 設計を変える場合を除き、raw な hex 値は増やさない

## Typography
- **Sans**: Geist Sans
- **Mono**: Geist Mono

タイポグラフィの方針:
- 見出しは `font-semibold` を基準に、必要なら `tracking-tight` を使う
- 本文は `text-sm` から base 相当の読みやすいサイズに保つ
- 補足文は `text-sm` と `text-muted-foreground` を使う
- Mono はコード、技術ラベル、桁揃えが必要な表示に限定する

このテンプレートは、個性よりも可読性と再利用性を優先します。
1画面内で複数のフォントファミリーを混在させないでください。

## Radius and Shape
角丸は単一の基準値から派生するトークンで統一します。

標準の形状ルール:
- 小さなコントロール: `rounded-md`
- カードや大きなコンテナ: `rounded-xl`
- バッジやピル: `rounded-full`

角の立った要素と丸い要素を無秩序に混在させないでください。
独自の px 値ではなく、既存の radius scale を使います。

## Layout
- コンテンツは中央寄せのカラムにまとめ、最大幅を制御する
- グローバル構造は固定ヘッダー + 余白付きメイン
- 横方向の余白は広めに取り、縦方向のリズムを明確にする
- 多くのページは `max-w-4xl` から `max-w-5xl` の範囲に収める

このテンプレートでよく使う構成:
- ぼかし付きの半透明固定ヘッダー
- `px-6` を基準にした中央寄せメイン領域
- `space-y-8` 前後のセクション間隔
- デモ、フォーム、設定系 UI をカードで区切る構成

明確な理由がない限り、フルワイドなレイアウトは避けます。

## Components
- **Buttons**: 高さはコンパクト、`font-medium`、標準はニュートラル、variant は token ベースで管理
- **Inputs**: 1px border、透明またはごく薄い面、明確な focus ring、装飾は控えめ
- **Cards**: 面コントラスト + border で階層を作り、影はごく弱く使う
- **Tabs**: `muted` の土台に、active のタブだけ少し浮かせる
- **Badges**: コンパクトで pill 形状、semantic color で意味づけする

コンポーネントルール:
- 新しい土台コンポーネントを作る前に、shadcn/ui の primitive を再利用する
- variant 拡張は hardcode した色ではなく token 経由で行う
- フォームやフィルターではコントロールの高さを揃える
- hover は派手にせず、控えめな変化で十分とする

## Motion
モーションは装飾ではなく補助です。

現在の方向性:
- ヘッダーの導入のような、小さな entrance motion は許容する
- transition は短く穏やかにする
- 大きな変形より、blur・fade・短い位置移動を優先する

画面が寂しいからという理由だけでアニメーションを増やさないでください。

## Accessibility
- フォーカスは共有の `ring` token で必ず視認できるようにする
- ライト / ダークどちらでも十分なコントラストを確保する
- disabled は弱くしつつ、読めない状態にはしない
- 補足テキストを薄くしすぎて面に埋もれさせない

## Do's and Don'ts
- Do: 新しい UI は semantic token から組み立てる
- Do: 明示的にリブランドしない限り、中立で汎用的な見た目を保つ
- Do: 階層は border、余白、面コントラストで作る
- Do: ライト / ダークで振る舞いを対称に保つ
- Do: ページ構造は中央寄せ、十分な余白、読みやすい走査性を保つ

- Don't: feature 側コンポーネントに raw color を直書きする
- Don't: 単発で彩度の高いアクセント色を差し込む
- Don't: 重い drop shadow に頼って奥行きを作る
- Don't: 同一画面で角丸のルールを混在させる
- Don't: 必要性がないのに、ライト用 / ダーク用で別デザインを作る

## Implementation Notes for Humans and AI
- 新しい視覚的役割が必要なら、まず semantic token を追加する
- 新しい variant が必要なら、共有 UI primitive 側で拡張する
- 画面が平坦に見えるなら、色を足す前に余白と面の階層を見直す
- 画面がうるさく見えるなら、局所 override を減らして token system に戻す
