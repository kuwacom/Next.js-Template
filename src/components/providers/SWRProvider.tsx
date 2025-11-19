"use client";

import { apiFetcher } from "@/api/fetcher";
import { SWRConfig } from "swr";

export default function SWRProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRConfig
      value={{
        fetcher: apiFetcher,
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
