"use client";

import { SWRConfig } from "swr";

export default function SWRProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 2000,
        revalidateOnFocus: true,
        shouldRetryOnError: false,
        // fetcher: (resource, init) =>
        //   fetch(resource, init).then((res) => res.json()),
      }}
    >
      {children}
    </SWRConfig>
  );
}
