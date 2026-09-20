import "server-only";

import { z } from "zod";

import env, { envSchema } from "@/config/env";

const optionalEnvStringSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

// metadataBase や sitemap / robots に渡すため、末尾スラッシュを除去して正確な URL 連結を保証する
const siteUrlSchema = z
  .string()
  .url()
  .default("http://localhost:3000")
  .transform((value) => value.replace(/\/+$/, ""));

const serverEnvSchema = envSchema.extend({
  CLOUDFLARE_TURNSTILE_SECRET_KEY: optionalEnvStringSchema,
  DISCORD_WEBHOOK_AVATAR_URL: optionalEnvStringSchema,
  DISCORD_WEBHOOK_URL: optionalEnvStringSchema,
  DISCORD_WEBHOOK_USERNAME: optionalEnvStringSchema.default(
    "Next.js Contact Form",
  ),
  SITE_URL: siteUrlSchema,
});

const parsedServerEnv = serverEnvSchema.safeParse({
  ...env,
  CLOUDFLARE_TURNSTILE_SECRET_KEY:
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
  DISCORD_WEBHOOK_AVATAR_URL: process.env.DISCORD_WEBHOOK_AVATAR_URL,
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
  DISCORD_WEBHOOK_USERNAME: process.env.DISCORD_WEBHOOK_USERNAME,
  SITE_URL: process.env.SITE_URL,
});

if (!parsedServerEnv.success) {
  const details = parsedServerEnv.error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "env";
      return `- ${path}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(`サーバー環境変数の読み込みに失敗しました\n${details}`);
}

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const serverEnv: ServerEnv = parsedServerEnv.data;

export default serverEnv;
