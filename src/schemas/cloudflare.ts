import { z } from "zod";

// Cloudflare Turnstile のリクエストとレスポンスのスキーマ定義
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#api-response-format

export const turnstileSiteVerifyRequestSchema = z.object({
  idempotency_key: z.string().min(1),
  remoteip: z.string().min(1).optional(),
  response: z.string().min(1),
  secret: z.string().min(1),
});

export const turnstileSiteVerifyResponseSchema = z.object({
  action: z.string().optional(),
  cdata: z.string().optional(),
  "error-codes": z.array(z.string()).optional(),
  hostname: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  success: z.boolean(),
});

export type TurnstileSiteVerifyResponse = z.infer<
  typeof turnstileSiteVerifyResponseSchema
>;
