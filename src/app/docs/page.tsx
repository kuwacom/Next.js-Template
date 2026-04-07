import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buildMDXHref, getAllMDXContent } from "@/lib/mdx"

export const metadata: Metadata = {
  title: "Docs",
  description: "MDX ベースの記事一覧です。",
}

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "long",
})

export default async function DocsIndexPage() {
  const mdxPages = await getAllMDXContent()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-12">
      <section className="space-y-4 pt-4">
        <Badge variant="secondary">MDX Docs</Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">記事システム</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            `content/docs/` 配下の MDX ファイルを自動で一覧化し、`/docs/*` へルーティングします。
          </p>
        </div>
      </section>

      {mdxPages.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>記事がまだありません</CardTitle>
            <CardDescription>
              `content/docs/` ディレクトリに `.mdx` ファイルを追加すると、ここに表示されます。
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mdxPages.map((mdxPage) => (
            <Card
              key={mdxPage.slugAsPath}
              className="transition-colors hover:border-primary/40"
            >
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{dateFormatter.format(new Date(mdxPage.publishedAt))}</span>
                  <span>•</span>
                  <span>/{mdxPage.slugAsPath}</span>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl tracking-tight">
                    <Link href={buildMDXHref(mdxPage.slug)} className="hover:text-primary">
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
      )}
    </div>
  )
}
