import { z } from "zod";

const logLevelSchema = z.coerce.number().int().min(0).max(6);

const optionalEnvStringSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

export const envSchema = z.object({
  LOG_LEVEL: logLevelSchema.default(3),
  NEXT_PUBLIC_API_URL: z.string().default(""),
  NEXT_PUBLIC_API_VERSION: z.string().default(""),
  NEXT_PUBLIC_LOG_LEVEL: logLevelSchema.default(5),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalEnvStringSchema,
});

const parsedEnv = envSchema.safeParse({
  LOG_LEVEL: process.env.LOG_LEVEL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION,
  NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "env";
      return `- ${path}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(`環境変数の読み込みに失敗しました\n${details}`);
}

export type Env = z.infer<typeof envSchema>;

const env: Env = parsedEnv.data;

export default env;
