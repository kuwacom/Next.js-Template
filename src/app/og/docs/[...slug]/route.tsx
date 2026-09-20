import { ImageResponse } from "next/og";

import { OpenGraphImage } from "@/components/og/OpenGraphImage";
import { getMDXBySlug } from "@/lib/mdx";

// catch-all ルートの直下には opengraph-image.tsx を置けないため、
// docs 記事の OGP 画像は Route Handler で生成する
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const mdxPage = await getMDXBySlug(slug);

  return new ImageResponse(
    <OpenGraphImage
      title={mdxPage?.title ?? "Docs"}
      description={mdxPage?.description}
    />,
    {
      width: 1200,
      height: 630,
      // OGP 生成は CPU 負荷が高いため CDN 側にキャッシュさせる
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
    },
  );
}
