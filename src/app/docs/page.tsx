import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildMDXHref,
  getAllMDXContent,
  getMDXDirectoryIndexes,
} from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Docs",
  description: "MDX ベースの記事一覧です。",
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "long",
});

export default async function DocsIndexPage() {
  const mdxPages = await getAllMDXContent();
  // フォルダごとの index.mdx を、専用セクションでも案内できるように取得する
  const directoryIndexes = await getMDXDirectoryIndexes();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-12">
      <section className="space-y-4 pt-4">
        <Badge variant="secondary">MDX Docs</Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            記事システム
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            `content/docs/` 配下の MDX ファイルを自動で一覧化し、`/docs/*`
            へルーティングします。
          </p>
        </div>
      </section>

      {mdxPages.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>記事がまだありません</CardTitle>
            <CardDescription>
              `content/docs/` ディレクトリに `.mdx`
              ファイルを追加すると、ここに表示されます。
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-8">
          {directoryIndexes.length > 0 ? (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  フォルダ index
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  `content/docs/**/index.mdx`
                  を置くと、そのフォルダのトップページとして公開されます。
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
                        {/* index.mdx 自体ではなく、そのフォルダURLを表示する */}
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
                          index を開く
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
                記事一覧
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {/* フォルダ index も通常の公開記事としては一覧に含める */}
                通常の記事とフォルダ index をまとめて表示します。
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
                      <span>/{mdxPage.slugAsPath}</span>
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
                      <Link href={buildMDXHref(mdxPage.slug)}>記事を読む</Link>
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
