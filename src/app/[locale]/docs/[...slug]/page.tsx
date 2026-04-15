import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { MDXContent } from "@/components/docs/MDXContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAlternateLinks, getLocalizedHref, Link } from "@/i18n/navigation";
import { routing, isValidLocale } from "@/i18n/routing";
import {
  buildMDXHref,
  buildMDXPageMetadata,
  getMDXBySlug,
  getMDXStaticParams,
} from "@/lib/mdx";

type DocPageProps = {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
};

// generateStaticParams で列挙した slug だけを公開対象にする
// content に存在しないパスは動的生成せず 404 に寄せたいので false にする
export const dynamicParams = false;

export async function generateStaticParams() {
  // locale ごとに公開対象の記事 slug を集める
  // next-intl の prefix ルーティングに合わせて { locale, slug } の形へ整形する
  const localizedParams = await Promise.all(
    routing.locales.map(async (locale) => {
      const params = await getMDXStaticParams(locale);

      return params.map((param) => ({
        locale,
        slug: param.slug,
      }));
    }),
  );

  return localizedParams.flat();
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    return {
      title: "Not Found",
    };
  }

  const t = await getTranslations({ locale, namespace: "article" });
  const mdxPage = await getMDXBySlug(locale, slug);
  // alternates は locale 切り替え時の対応 URL を検索エンジンへ伝えるために使う
  const href = buildMDXHref(slug);

  if (!mdxPage) {
    return {
      title: t("notFound"),
      alternates: {
        canonical: getLocalizedHref(locale, href),
        languages: getAlternateLinks(href),
      },
    };
  }

  return {
    ...buildMDXPageMetadata(mdxPage, t("metaSuffix")),
    alternates: {
      canonical: getLocalizedHref(locale, href),
      languages: getAlternateLinks(href),
    },
  };
}

export default async function DocDetailPage({ params }: DocPageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "article" });
  const mdxPage = await getMDXBySlug(locale, slug);

  if (!mdxPage) {
    notFound();
  }

  const dateFormatter = new Intl.DateTimeFormat(
    locale === "ja" ? "ja-JP" : "en-US",
    {
      dateStyle: "long",
    },
  );
  // パンくずは現在の slug を先頭から積み上げて組み立てる
  // guides/writing-docs なら /docs/guides と /docs/guides/writing-docs を作る
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
          <Link href="/docs">← {t("backToDocs")}</Link>
        </Button>
      </div>

      <header className="space-y-5 border-b border-border pb-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground">
            {t("breadcrumbRoot")}
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
            <Badge variant="secondary">{t("badge")}</Badge>
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
