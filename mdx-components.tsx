import type { MDXComponents } from "mdx/types"
import Link from "next/link"
import type { ComponentPropsWithoutRef } from "react"

import { Callout } from "@/components/docs/Callout"
import { Badge } from "@/components/ui/badge"

function MdxLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  const isInternalLink = href.startsWith("/") || href.startsWith("#")

  if (isInternalLink) {
    return <Link href={href} {...props} />
  }

  return <a href={href} rel="noreferrer" target="_blank" {...props} />
}

export function useMDXComponents(): MDXComponents {
  return {
    a: MdxLink,
    Badge,
    Callout,
  }
}
