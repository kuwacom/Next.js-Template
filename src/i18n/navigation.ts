import { createNavigation } from "next-intl/navigation";

import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

// next/link や next/navigation の代わりに locale-aware な API を公開する
// アプリ内の遷移はこのラッパー経由に揃えると prefix の扱いがぶれにくい
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

// locale を指定して内部 href を実際の公開 URL へ変換する
export function getLocalizedHref(locale: AppLocale, href: string) {
  return getPathname({ locale, href });
}

// metadata.alternates.languages 用のリンク辞書をまとめて作る
export function getAlternateLinks(href: string) {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, getLocalizedHref(locale, href)]),
  ) as Record<AppLocale, string>;
}
