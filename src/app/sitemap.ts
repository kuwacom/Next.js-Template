import type { MetadataRoute } from "next";

import serverEnv from "@/config/serverEnv";

// 公開ページのルート一覧
// route を追加・削除したときはここも一緒に更新する
const publicRoutes = ["/", "/from/action", "/from/api", "/swr"];

export default function sitemap(): MetadataRoute.Sitemap {
  // SITE_URL は末尾スラッシュ無しに正規化済みのため連結は単純結合でよい
  return publicRoutes.map((route) => ({
    url: `${serverEnv.SITE_URL}${route === "/" ? "" : route}`,
    lastModified: new Date(),
  }));
}
