import { ImageResponse } from "next/og";

import { OpenGraphImage } from "@/components/og/OpenGraphImage";

export const alt = "Next.js Template";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OpenGraphImage
      title="Next.js Template"
      description="Next.js 16 / React 19 / TypeScript 5 をベースにした Web アプリ用テンプレート"
    />,
    {
      ...size,
      // OGP 生成は CPU 負荷が高いため CDN 側にキャッシュさせる
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
    },
  );
}
