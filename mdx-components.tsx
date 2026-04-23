import Link from "next/link";
import type { ComponentPropsWithoutRef, ComponentType } from "react";

import { Callout } from "@/components/docs/Callout";
import { Badge } from "@/components/ui/badge";

function MdxLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  const isInternalLink = href.startsWith("/") || href.startsWith("#");

  if (isInternalLink) {
    return <Link href={href} {...props} />;
  }

  return <a href={href} rel="noreferrer" target="_blank" {...props} />;
}

export type MDXComponentMap = Record<string, ComponentType<any>>;

export const sharedMDXComponents = {
  a: MdxLink,
  Badge,
  Callout,
} satisfies MDXComponentMap;
