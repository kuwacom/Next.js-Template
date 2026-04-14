import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MDXContentProps = {
  children: ReactNode;
  className?: string;
};

export function MDXContent({ children, className }: MDXContentProps) {
  return <article className={cn("mdx-content", className)}>{children}</article>;
}
