import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import serverEnv from "@/config/serverEnv";
import { buildMDXHref, getMDXStaticParams } from "@/lib/mdx";

// locale 付きで公開するページのパス一覧
// route を追加・削除したときはここも一緒に更新する
const publicPaths = ["/", "/docs", "/forms", "/forms/action", "/forms/api", "/swr"];

// locale が付かない固定ルートの一覧
// 旧構成の英語固定ページが残っているため、実在するものを列挙する
const rootPaths = ["/from/action", "/from/api"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // SITE_URL は末尾スラッシュ無しに正規化済みのため連結は単純結合でよい
  const lastModified = new Date();

  // locale 付きルートは locales x paths の組み合わせで列挙する
  const localeRoutes = routing.locales.flatMap((locale) =>
    publicPaths.map((path) => ({
      url: `${serverEnv.SITE_URL}/${locale}${path === "/" ? "" : path}`,
      lastModified,
    })),
  );

  const rootRoutes = rootPaths.map((path) => ({
    url: `${serverEnv.SITE_URL}${path}`,
    lastModified,
  }));

  // docs の詳細ページは generateStaticParams と同じ基準で列挙する
  const docsRoutes: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    const staticParams = await getMDXStaticParams(locale);
    for (const { slug } of staticParams) {
      docsRoutes.push({
        // buildMDXHref に locale 付き basePath を渡すため、URL に locale の前置は不要
        url: `${serverEnv.SITE_URL}${buildMDXHref(slug, `/${locale}/docs`)}`,
        lastModified,
      });
    }
  }

  return [...localeRoutes, ...rootRoutes, ...docsRoutes];
}
