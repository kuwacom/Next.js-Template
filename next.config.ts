import type { NextConfig } from "next";

const isDev = process.argv.includes("dev");
const isBuild = process.argv.includes("build");

if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = "1";
  import("velite").then((mod) =>
    mod.build({
      watch: isDev,
      clean: !isDev,
    }),
  );
}

const nextConfig: NextConfig = {};

export default nextConfig;
