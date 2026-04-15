import type { MDXComponents } from "mdx/types"
import type { ComponentPropsWithoutRef } from "react"

import { Link } from "@/i18n/navigation"
import { Callout } from "@/components/docs/Callout"
import { Badge } from "@/components/ui/badge"

function MdxLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  const isAnchorLink = href.startsWith("#")
  const isInternalLink = href.startsWith("/")

  if (isAnchorLink) {
    return <a href={href} {...props} />
  }

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
