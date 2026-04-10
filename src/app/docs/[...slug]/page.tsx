import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MDXContent } from "@/components/docs/MDXContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildMDXHref,
  buildMDXPageMetadata,
  getMDXBySlug,
  getMDXStaticParams,
} from "@/lib/mdx";

type DocPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "long",
});

export const dynamicParams = false;

export async function generateStaticParams() {
  return getMDXStaticParams();
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const mdxPage = await getMDXBySlug(slug);

  if (!mdxPage) {
    return {
      title: "Not Found",
    };
  }

  return buildMDXPageMetadata(mdxPage);
}

export default async function DocDetailPage({ params }: DocPageProps) {
  const { slug } = await params;
  const mdxPage = await getMDXBySlug(slug);

  if (!mdxPage) {
    notFound();
  }

  const breadcrumbs = mdxPage.slug.map((segment, index) => ({
    label: segment,
    href: buildMDXHref(mdxPage.slug.slice(0, index + 1)),
  }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 pb-16 pt-4">
      <div className="flex items-center justify-between gap-4">
        <Button
          asChild
          variant="ghost"
          className="px-0 text-muted-foreground hover:bg-transparent"
        >
          <Link href="/docs">← 記事一覧へ戻る</Link>
        </Button>
      </div>

      <header className="space-y-5 border-b border-border pb-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground">
            docs
          </Link>
          {breadcrumbs.map((breadcrumb) => (
            <span key={breadcrumb.href} className="flex items-center gap-2">
              <span>/</span>
              <Link href={breadcrumb.href} className="hover:text-foreground">
                {breadcrumb.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary">MDX Article</Badge>
            <span>{dateFormatter.format(new Date(mdxPage.publishedAt))}</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight">
              {mdxPage.title}
            </h1>
            {mdxPage.description ? (
              <p className="text-base leading-7 text-muted-foreground">
                {mdxPage.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {mdxPage.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      <MDXContent>
        <mdxPage.Content />
      </MDXContent>
    </div>
  );
}
