import rehypePrism from "@mapbox/rehype-prism";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import { defineConfig, s } from "velite";

const tocHeadingPattern = "(toc|table[ -]of[ -]contents?|目次)";

export default defineConfig({
  root: "content/docs",
  output: {
    data: "src/generated/velite",
    clean: true,
  },
  mdx: {
    remarkPlugins: [
      remarkGfm,
      remarkMath,
      [remarkToc, { heading: tocHeadingPattern }],
      remarkBreaks,
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      [rehypePrism, { ignoreMissing: true }],
    ],
  },
  collections: {
    docs: {
      name: "Doc",
      pattern: "**/*.mdx",
      schema: s.object({
        title: s.string().optional(),
        description: s.string().optional(),
        publishedAt: s.isodate().optional(),
        tags: s.array(s.string()).default([]),
        draft: s.boolean().default(false),
        path: s.path(),
        sourcePath: s.path({ removeIndex: false }),
        code: s.mdx(),
      }),
    },
  },
});
