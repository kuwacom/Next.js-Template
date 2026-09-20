import type { MetadataRoute } from "next";

import serverEnv from "@/config/serverEnv";
import { buildMDXHref, getMDXStaticParams } from "@/lib/mdx";

// MDX 以外の公開ページのルート一覧
// route を追加・削除したときはここも一緒に更新する
const publicRoutes = ["/", "/docs", "/from/action", "/from/api", "/swr"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // SITE_URL は末尾スラッシュ無しに正規化済みのため連結は単純結合でよい
  const staticRoutes = publicRoutes.map((route) => ({
    url: `${serverEnv.SITE_URL}${route === "/" ? "" : route}`,
    lastModified: new Date(),
  }));

  // docs の詳細ページは generateStaticParams と同じ基準で列挙する
  const docsRoutes = (await getMDXStaticParams()).map(({ slug }) => ({
    url: `${serverEnv.SITE_URL}${buildMDXHref(slug)}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...docsRoutes];
}
