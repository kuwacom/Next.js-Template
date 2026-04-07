import "server-only"

import type { Metadata } from "next"
import path from "node:path"
import { promises as fs } from "node:fs"
import { cache } from "react"
import type { ComponentType } from "react"
import type { MDXComponents } from "mdx/types"

// MDXコンテンツのソース配置先
// app配下のルーティング実装から切り離して再利用性を高める
const MDX_SOURCE_DIRECTORY = path.join(process.cwd(), "content", "docs")

// MDX1件に必要なメタ情報の標準形
export type MDXMetadata = {
  title: string
  description: string
  publishedAt: string
  tags: string[]
  draft: boolean
}

// 一覧画面向けの軽量データ
export type MDXSummary = MDXMetadata & {
  slug: string[]
  slugAsPath: string
}

// 詳細画面向けの完全データ
// Contentには@next/mdxで変換済みのReact Componentが入る
export type MDXPage = MDXSummary & {
  Content: ComponentType<{
    components?: MDXComponents
  }>
}

// 走査時に内部で使う最小情報
type MDXEntry = {
  slug: string[]
  slugAsPath: string
}

// 各mdxモジュールがexportする構造
// defaultが本文Component、metadataは任意の静的情報
type MDXModule = {
  default: ComponentType<{
    components?: MDXComponents
  }>
  metadata?: Partial<MDXMetadata>
}

// ファイル名ベースのフォールバックタイトル生成
// metadata.titleが未指定でも一覧が破綻しないようにする
function buildTitleFromSlug(slug: string[]) {
  const lastSegment = slug.at(-1) ?? "untitled"

  return lastSegment
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

// 記事ごとのmetadataを安全な形へ正規化
// 欠損値や型ズレを吸収して、描画側の分岐を最小化する
function normalizeMDXMetadata(
  metadata: Partial<MDXMetadata> | undefined,
  slug: string[]
): MDXMetadata {
  return {
    title:
      typeof metadata?.title === "string" && metadata.title.trim().length > 0
        ? metadata.title
        : buildTitleFromSlug(slug),
    description:
      typeof metadata?.description === "string" ? metadata.description : "",
    publishedAt:
      typeof metadata?.publishedAt === "string"
        ? metadata.publishedAt
        : new Date().toISOString().slice(0, 10),
    tags: Array.isArray(metadata?.tags)
      ? metadata.tags.filter(
          (tag): tag is string => typeof tag === "string" && tag.trim().length > 0
        )
      : [],
    draft: metadata?.draft === true,
  }
}

// content/docsを再帰走査し、.mdxだけを収集
// ディレクトリ構造をそのままslugへ写像する
// ENOENT時は空配列を返して初期状態でも安全に動かす
async function walkMDXDirectory(
  directory: string,
  segments: string[] = []
): Promise<MDXEntry[]> {
  const entries = await fs
    .readdir(directory, { withFileTypes: true })
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return null
      }

      throw error
    })

  if (!entries) {
    return []
  }

  const discoveredEntries = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name)

      // サブディレクトリを再帰的に探索し、slugの前半として保持
      if (entry.isDirectory()) {
        return walkMDXDirectory(absolutePath, [...segments, entry.name])
      }

      // mdx以外は記事として扱わない
      if (!entry.isFile() || !entry.name.endsWith(".mdx")) {
        return []
      }

      const fileSlug = entry.name.replace(/\.mdx$/, "")
      const slug = [...segments, fileSlug]

      return [
        {
          slug,
          slugAsPath: slug.join("/"),
        },
      ]
    })
  )

  return discoveredEntries.flat()
}

// 走査結果をキャッシュし、同一リクエスト内の重複I/Oを抑制
// slug順ソートで出力順を安定化
const getMDXEntries = cache(async () => {
  const entries = await walkMDXDirectory(MDX_SOURCE_DIRECTORY)

  return entries.sort((left, right) => left.slugAsPath.localeCompare(right.slugAsPath))
})

// @next/mdxで処理されたmdxモジュールを動的import
// 実際のコンパイルはNextのビルドパイプラインが担当する
const importMDXModule = cache(async (slugAsPath: string): Promise<MDXModule> => {
  return (await import(`@mdx-content/${slugAsPath}.mdx`)) as MDXModule
})

// 単一記事を読み込み、表示用データへ整形
// metadata正規化と本文Componentの結合をここで実施
const loadMDXPage = cache(async (slugAsPath: string): Promise<MDXPage> => {
  const slug = slugAsPath.split("/").filter(Boolean)
  const mdxModule = await importMDXModule(slugAsPath)

  return {
    ...normalizeMDXMetadata(mdxModule.metadata, slug),
    slug,
    slugAsPath,
    Content: mdxModule.default,
  }
})

// 公開記事の一覧を生成
// draft除外、日付降順、同日ならタイトル順で安定ソート
export const getAllMDXContent = cache(async (): Promise<MDXSummary[]> => {
  const entries = await getMDXEntries()
  const mdxPages = await Promise.all(entries.map((entry) => loadMDXPage(entry.slugAsPath)))

  return mdxPages
    .filter((mdxPage) => !mdxPage.draft)
    .sort((left, right) => {
      const byDate =
        new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()

      return byDate !== 0 ? byDate : left.title.localeCompare(right.title)
    })
    .map((mdxPage) => ({
      title: mdxPage.title,
      description: mdxPage.description,
      publishedAt: mdxPage.publishedAt,
      tags: mdxPage.tags,
      draft: mdxPage.draft,
      slug: mdxPage.slug,
      slugAsPath: mdxPage.slugAsPath,
    }))
})

// slugから単一記事を取得
// 存在しない記事とdraft記事はnullを返して404処理へ委譲
export async function getMDXBySlug(slug: string[]): Promise<MDXPage | null> {
  const slugAsPath = slug.join("/")
  const matchingEntry = (await getMDXEntries()).find(
    (entry) => entry.slugAsPath === slugAsPath
  )

  if (!matchingEntry) {
    return null
  }

  const mdxPage = await loadMDXPage(matchingEntry.slugAsPath)

  return mdxPage.draft ? null : mdxPage
}

// generateStaticParams向けにslug配列だけを抽出
export async function getMDXStaticParams() {
  const mdxPages = await getAllMDXContent()

  return mdxPages.map((mdxPage) => ({ slug: mdxPage.slug }))
}

// slug配列から/docs配下のURLを構築
export function buildMDXHref(slug: string[], basePath: string = "/docs") {
  return `${basePath}/${slug.join("/")}`
}

// 記事詳細ページのmetadataを統一生成
export function buildMDXPageMetadata(
  mdxSummary: MDXSummary,
  titleSuffix: string = "Docs"
): Metadata {
  return {
    title: `${mdxSummary.title} | ${titleSuffix}`,
    description: mdxSummary.description,
  }
}
