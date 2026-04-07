import createMDX from "@next/mdx"
import type { NextConfig } from "next"

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      "remark-gfm",
      "remark-math",
      ["remark-toc", { heading: "(toc|table[ -]of[ -]contents?|目次)" }],
      "remark-breaks",
    ],
    rehypePlugins: [
      "rehype-slug",
      "rehype-katex",
      ["@mapbox/rehype-prism", { ignoreMissing: true }],
    ],
  },
})

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
}

export default withMDX(nextConfig)
