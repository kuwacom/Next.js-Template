import "server-only";

import type { Metadata } from "next";
import path from "node:path";
import { promises as fs } from "node:fs";
import { cache } from "react";
import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";

// MDXコンテンツのソース配置先
// app配下のルーティング実装から切り離して再利用性を高める
const MDX_SOURCE_DIRECTORY = path.join(process.cwd(), "content", "docs");

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
// Contentには@next/mdxで変換済みのReact Componentが入る
export type MDXPage = MDXSummary & {
  Content: ComponentType<{
    components?: MDXComponents;
  }>;
};

// 走査時に内部で使う最小情報
type MDXEntry = {
  slug: string[];
  slugAsPath: string;
  importPath: string;
};

export type MDXDirectoryIndex = MDXSummary & {
  directorySlug: string[];
  directoryPath: string;
};

// 各mdxモジュールがexportする構造
// defaultが本文Component、metadataは任意の静的情報
type MDXModule = {
  default: ComponentType<{
    components?: MDXComponents;
  }>;
  metadata?: Partial<MDXMetadata>;
};

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
 * MDX モジュールが export した `metadata` を、表示に使いやすい標準形へ正規化します。
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
 * `content/docs` 配下を再帰走査し、公開対象の MDX エントリ一覧を収集します。
 *
 * - ディレクトリ構造はそのまま URL 用の slug に変換されます
 * - `index.mdx` は `/docs/foo/index` ではなく `/docs/foo` として扱います
 * - ディレクトリがまだ存在しない場合は空配列を返し、初期状態でも安全に動作します
 */
async function walkMDXDirectory(
  directory: string,
  segments: string[] = [],
): Promise<MDXEntry[]> {
  const entries = await fs
    .readdir(directory, { withFileTypes: true })
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return null;
      }

      throw error;
    });

  if (!entries) {
    return [];
  }

  const discoveredEntries = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);

      // サブディレクトリを再帰的に探索し、slugの前半として保持
      if (entry.isDirectory()) {
        return walkMDXDirectory(absolutePath, [...segments, entry.name]);
      }

      // mdx以外は記事として扱わない
      if (!entry.isFile() || !entry.name.endsWith(".mdx")) {
        return [];
      }

      const fileSlug = entry.name.replace(/\.mdx$/, "");
      // index.mdx は公開URLでは /docs/foo に寄せるが、import には元のファイル名を使う
      const slug =
        fileSlug === "index" ? [...segments] : [...segments, fileSlug];
      const importPath = [...segments, fileSlug].join("/");

      if (slug.length === 0) {
        // app 下でベースページを実装する前提のため
        // content/docs/index.mdx は現状サポート対象外として一覧から除外する
        return [];
      }

      return [
        {
          slug,
          slugAsPath: slug.join("/"),
          importPath,
        },
      ];
    }),
  );

  return discoveredEntries.flat();
}

/**
 * MDX ファイル走査結果をキャッシュ付きで取得します。
 *
 * 同一リクエスト中の重複 I/O を抑えつつ、`slugAsPath` 順に並べて安定した結果を返します。
 */
const getMDXEntries = cache(async () => {
  const entries = await walkMDXDirectory(MDX_SOURCE_DIRECTORY);

  return entries.sort((left, right) =>
    left.slugAsPath.localeCompare(right.slugAsPath),
  );
});

/**
 * `@next/mdx` によってビルド対象になった MDX モジュールを動的 import します。
 *
 * `slugAsPath` ではなく実ファイル基準の `importPath` を受け取ることで、
 * `guides/index.mdx` のようなファイルも `/docs/guides` として公開できます。
 */
const importMDXModule = cache(
  async (importPath: string): Promise<MDXModule> => {
    return (await import(`@mdx-content/${importPath}.mdx`)) as MDXModule;
  },
);

/**
 * 1 件の MDX エントリを読み込み、画面表示用の完全なページデータへ変換します。
 *
 * 本文コンポーネントと正規化済み metadata をここで結合します。
 */
const loadMDXPage = cache(async (entry: MDXEntry): Promise<MDXPage> => {
  const mdxModule = await importMDXModule(entry.importPath);

  return {
    ...normalizeMDXMetadata(mdxModule.metadata, entry.slug),
    slug: entry.slug,
    slugAsPath: entry.slugAsPath,
    Content: mdxModule.default,
  };
});

/**
 * 公開対象の MDX 記事一覧を取得します。
 *
 * - `draft: true` は除外します
 * - `publishedAt` の降順で並べます
 * - 同日の場合はタイトル順で安定化します
 */
export const getAllMDXContent = cache(async (): Promise<MDXSummary[]> => {
  const entries = await getMDXEntries();
  const mdxPages = await Promise.all(
    entries.map((entry) => loadMDXPage(entry)),
  );

  return mdxPages
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
  const matchingEntry = (await getMDXEntries()).find(
    (entry) => entry.slugAsPath === slugAsPath,
  );

  if (!matchingEntry) {
    return null;
  }

  const mdxPage = await loadMDXPage(matchingEntry);

  return mdxPage.draft ? null : mdxPage;
}

/**
 * フォルダ配下の `index.mdx` だけを抽出し、フォルダトップページとして扱いやすい形で返します。
 *
 * たとえば `content/docs/guides/index.mdx` は `/docs/guides` 用の index 情報として取得できます。
 */
export const getMDXDirectoryIndexes = cache(
  async (): Promise<MDXDirectoryIndex[]> => {
    const mdxPages = await getAllMDXContent();

    return mdxPages
      .map((mdxPage) => {
        const fileName = mdxPage.slugAsPath.split("/").at(-1);
        const isDirectoryIndex = fileName === "index";
        // guides/index.mdx のようなファイルから、フォルダ自体のURL情報を作る
        const directorySlug = isDirectoryIndex
          ? mdxPage.slug
          : mdxPage.slug.slice(0, -1);

        return {
          ...mdxPage,
          directorySlug,
          directoryPath: directorySlug.join("/"),
        };
      })
      .filter((mdxPage): mdxPage is MDXDirectoryIndex => {
        // フォルダ配下の index.mdx だけを「フォルダ index」として扱う
        return (
          mdxPage.directorySlug.length > 0 &&
          mdxPage.slugAsPath.endsWith("/index")
        );
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
  return `${basePath}/${slug.join("/")}`;
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
