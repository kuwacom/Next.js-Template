import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAlternateLinks, getLocalizedHref, Link } from "@/i18n/navigation";
import { isValidLocale } from "@/i18n/routing";
import {
  buildMDXHref,
  getAllMDXContent,
  getMDXDirectoryIndexes,
} from "@/lib/mdx";

type DocsIndexPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: DocsIndexPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {
      title: "Not Found",
    };
  }

  const t = await getTranslations({ locale, namespace: "docs" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    // hreflang 用の alternate URL を locale ごとに出す
    alternates: {
      canonical: getLocalizedHref(locale, "/docs"),
      languages: getAlternateLinks("/docs"),
    },
  };
}

export default async function DocsIndexPage({ params }: DocsIndexPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "docs" });
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "ja" ? "ja-JP" : "en-US",
    {
      dateStyle: "long",
    },
  );

  // 通常記事の一覧と、フォルダ index 用の記事一覧を分けて取得する
  // 表示上は別セクションだが、元データは同じ MDX 群から組み立てている
  const mdxPages = await getAllMDXContent(locale);
  const directoryIndexes = await getMDXDirectoryIndexes(locale);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-12">
      <section className="space-y-4 pt-4">
        <Badge variant="secondary">{t("badge")}</Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            {t("description", { locale })}
          </p>
        </div>
      </section>

      {mdxPages.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("noArticles")}</CardTitle>
            <CardDescription>
              {t("noArticlesDescription", { locale })}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-8">
          {directoryIndexes.length > 0 ? (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("folderIndex")}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("folderIndexDescription", { locale })}
                </p>
              </div>

              <div className="grid gap-4">
                {directoryIndexes.map((mdxPage) => (
                  <Card
                    key={mdxPage.slugAsPath}
                    className="transition-colors hover:border-primary/40"
                  >
                    <CardHeader className="gap-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {dateFormatter.format(new Date(mdxPage.publishedAt))}
                        </span>
                        <span>•</span>
                        <span>/docs/{mdxPage.directoryPath}</span>
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-2xl tracking-tight">
                          <Link
                            // guides/index.mdx は /docs/guides として公開する
                            href={buildMDXHref(mdxPage.directorySlug)}
                            className="hover:text-primary"
                          >
                            {mdxPage.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-sm leading-6">
                          {mdxPage.description}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {mdxPage.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button asChild variant="outline">
                        <Link href={buildMDXHref(mdxPage.directorySlug)}>
                          {t("openIndex")}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                {t("articleList")}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {/* フォルダ index も通常の公開記事としては一覧に含める */}
                {t("articleListDescription")}
              </p>
            </div>

            <div className="grid gap-4">
              {mdxPages.map((mdxPage) => (
                <Card
                  key={mdxPage.slugAsPath}
                  className="transition-colors hover:border-primary/40"
                >
                  <CardHeader className="gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {dateFormatter.format(new Date(mdxPage.publishedAt))}
                      </span>
                      <span>•</span>
                      <span>{buildMDXHref(mdxPage.slug)}</span>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl tracking-tight">
                        <Link
                          href={buildMDXHref(mdxPage.slug)}
                          className="hover:text-primary"
                        >
                          {mdxPage.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-sm leading-6">
                        {mdxPage.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {mdxPage.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button asChild variant="outline">
                      <Link href={buildMDXHref(mdxPage.slug)}>
                        {t("readArticle")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
