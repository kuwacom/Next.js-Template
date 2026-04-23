/* eslint-disable react-hooks/static-components */
import * as runtime from "react/jsx-runtime";
import { cache } from "react";

import { sharedMDXComponents, type MDXComponentMap } from "../../../mdx-components";
import { cn } from "@/lib/utils";

type MDXRendererProps = {
  code: string;
  components?: MDXComponentMap;
};

type MDXContentProps = MDXRendererProps & {
  className?: string;
};

const getMDXComponent = cache((code: string) => {
  // Velite の `s.mdx()` は JSX runtime を受け取る関数本体を返す。
  const fn = new Function(code);
  return fn({ ...runtime }).default;
});

function MDXRenderer({ code, components }: MDXRendererProps) {
  const Component = getMDXComponent(code);

  return <Component components={{ ...sharedMDXComponents, ...components }} />;
}

export function MDXContent({
  code,
  className,
  components,
}: MDXContentProps) {
  return (
    <article className={cn("mdx-content", className)}>
      <MDXRenderer code={code} components={components} />
    </article>
  );
}
