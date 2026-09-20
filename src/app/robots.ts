import type { MetadataRoute } from "next";

import serverEnv from "@/config/serverEnv";

// 全ページをクロール許可して sitemap の場所を伝える
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${serverEnv.SITE_URL}/sitemap.xml`,
  };
}
