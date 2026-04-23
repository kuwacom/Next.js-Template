import "server-only";

import type { Metadata } from "next";
import { cache } from "react";

import { docs as generatedDocs } from "@/generated/velite";

// MDX1件に必要なメタ情報の標準形
export type MDXMetadata = {
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
  draft: boolean;
};

// 一覧画面向けの軽量データ
export type MDXSummary = MDXMetadata & {
  slug: string[];
  slugAsPath: string;
};

// 詳細画面向けの完全データ
export type MDXPage = MDXSummary & {
  isDirectoryIndex: boolean;
  code: string;
};

export type MDXDirectoryIndex = MDXSummary & {
  directorySlug: string[];
  directoryPath: string;
};

type GeneratedDocEntry = (typeof generatedDocs)[number];

/**
 * slug の末尾セグメントから、人が読めるフォールバックタイトルを生成します。
 *
 * `metadata.title` が未指定でも一覧や詳細ページの表示が崩れないようにするために使います。
 */
function buildTitleFromSlug(slug: string[]) {
  const lastSegment = slug.at(-1) ?? "untitled";

  return lastSegment
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

/**
 * Velite が抽出した frontmatter を、表示に使いやすい標準形へ正規化します。
 *
 * 欠損値や型の揺れを吸収し、呼び出し側が個別の null チェックを持たずに済むようにします。
 */
function normalizeMDXMetadata(
  metadata: Partial<MDXMetadata> | undefined,
  slug: string[],
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
          (tag): tag is string =>
            typeof tag === "string" && tag.trim().length > 0,
        )
      : [],
    draft: metadata?.draft === true,
  };
}

/**
 * Velite が生成した path を slug と表示用パスに変換します。
 */
function parseGeneratedPath(path: string) {
  const slug = path.split("/").filter(Boolean);

  return {
    slug,
    slugAsPath: slug.join("/"),
  };
}

/**
 * Velite の生成物を、アプリ側で扱いやすい標準形へ寄せます。
 */
function normalizeGeneratedDocEntry(entry: GeneratedDocEntry): MDXPage | null {
  const parsedPath = parseGeneratedPath(entry.path);
  const parsedSourcePath = parseGeneratedPath(entry.sourcePath);

  if (parsedPath.slug.length === 0 || parsedSourcePath.slug.length === 0) {
    return null;
  }

  const isDirectoryIndex =
    parsedSourcePath.slug.at(-1) === "index" &&
    parsedSourcePath.slug.length > 1;

  return {
    ...normalizeMDXMetadata(
      {
        title: entry.title,
        description: entry.description,
        publishedAt: entry.publishedAt,
        tags: entry.tags,
        draft: entry.draft,
      },
      parsedPath.slug,
    ),
    slug: parsedPath.slug,
    slugAsPath: parsedPath.slugAsPath,
    isDirectoryIndex,
    code: entry.code,
  };
}

const normalizedMDXPages = generatedDocs
  .map((entry) => normalizeGeneratedDocEntry(entry))
  .filter((entry): entry is MDXPage => entry !== null);

const getMDXPages = cache(() =>
  [...normalizedMDXPages].sort((left, right) =>
    left.slugAsPath.localeCompare(right.slugAsPath),
  ),
);

/**
 * 公開対象の MDX 記事一覧を取得します。
 *
 * - `draft: true` は除外します
 * - `publishedAt` の降順で並べます
 * - 同日の場合はタイトル順で安定化します
 */
export const getAllMDXContent = cache(async (): Promise<MDXSummary[]> => {
  return getMDXPages()
    .filter((mdxPage) => !mdxPage.draft)
    .sort((left, right) => {
      const byDate =
        new Date(right.publishedAt).getTime() -
        new Date(left.publishedAt).getTime();

      return byDate !== 0 ? byDate : left.title.localeCompare(right.title);
    })
    .map((mdxPage) => ({
      title: mdxPage.title,
      description: mdxPage.description,
      publishedAt: mdxPage.publishedAt,
      tags: mdxPage.tags,
      draft: mdxPage.draft,
      slug: mdxPage.slug,
      slugAsPath: mdxPage.slugAsPath,
    }));
});

/**
 * URL slug から単一の MDX 記事を取得します。
 *
 * 記事が存在しない場合、または `draft` の場合は `null` を返します。
 * ルーティング側で `notFound()` に委譲したいときに使います。
 */
export async function getMDXBySlug(slug: string[]): Promise<MDXPage | null> {
  const slugAsPath = slug.join("/");
  const matchingEntry = getMDXPages().find(
    (mdxPage) => mdxPage.slugAsPath === slugAsPath,
  );

  if (!matchingEntry) {
    return null;
  }

  return matchingEntry.draft ? null : matchingEntry;
}

/**
 * フォルダ配下の `index.mdx` だけを抽出し、フォルダトップページとして扱いやすい形で返します。
 *
 * たとえば `content/docs/guides/index.mdx` は `/docs/guides` 用の index 情報として取得できます。
 */
export const getMDXDirectoryIndexes = cache(
  async (): Promise<MDXDirectoryIndex[]> => {
    return getMDXPages()
      .filter((mdxPage) => !mdxPage.draft && mdxPage.isDirectoryIndex)
      .map((mdxPage) => {
        const directorySlug = mdxPage.slug;

        return {
          title: mdxPage.title,
          description: mdxPage.description,
          publishedAt: mdxPage.publishedAt,
          tags: mdxPage.tags,
          draft: mdxPage.draft,
          slug: mdxPage.slug,
          slugAsPath: mdxPage.slugAsPath,
          directorySlug,
          directoryPath: directorySlug.join("/"),
        };
      })
      .sort((left, right) =>
        left.directoryPath.localeCompare(right.directoryPath),
      );
  },
);

/**
 * App Router の `generateStaticParams` 用に、公開対象の記事 slug 一覧を返します。
 */
export async function getMDXStaticParams() {
  const mdxPages = await getAllMDXContent();

  return mdxPages.map((mdxPage) => ({ slug: mdxPage.slug }));
}

/**
 * slug 配列から docs 配下の公開 URL を組み立てます。
 *
 * @param slug URL に変換したい slug セグメント配列
 * @param basePath ルートパス。既定値は `/docs`
 */
export function buildMDXHref(slug: string[], basePath: string = "/docs") {
  return slug.length > 0 ? `${basePath}/${slug.join("/")}` : basePath;
}

/**
 * MDX 記事から Next.js の `Metadata` を生成します。
 *
 * 詳細ページごとの title / description を統一ルールで組み立てたいときに使います。
 */
export function buildMDXPageMetadata(
  mdxSummary: MDXSummary,
  titleSuffix: string = "Docs",
): Metadata {
  return {
    title: `${mdxSummary.title} | ${titleSuffix}`,
    description: mdxSummary.description,
  };
}
