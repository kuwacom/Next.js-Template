import { defineRouting } from "next-intl/routing";

// next-intl 全体で共有する locale 定義
// locale prefix 付きの URL 構造やデフォルト言語をここに集約する
export const routing = defineRouting({
  locales: ["en", "ja"],
  defaultLocale: "en",
  // Accept-Language と cookie をもとに locale を判定する
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];

// 動的 params や requestLocale の値を安全に扱うための型ガード
export function isValidLocale(locale: string): locale is AppLocale {
  return routing.locales.includes(locale as AppLocale);
}
