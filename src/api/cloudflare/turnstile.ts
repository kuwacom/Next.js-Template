import { createApiClient } from "@/api/apiClient";
import {
  turnstileSiteVerifyRequestSchema,
  turnstileSiteVerifyResponseSchema,
} from "@/schemas/cloudflare";

// Cloudflare Turnstile のサーバーサイド検証ロジック
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

const turnstileApiClient = createApiClient({
  baseUrl: "https://challenges.cloudflare.com/turnstile/v0",
  timeout: 10000,
  useAuth: false,
});

export async function verifyTurnstileToken(input: {
  expectedAction: string;
  ipAddress: string | null;
  token: string;
}) {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    return {
      errors: ["missing-turnstile-secret"],
      success: false,
    } as const;
  }

  const payload = turnstileSiteVerifyRequestSchema.parse({
    idempotency_key: crypto.randomUUID(),
    remoteip: input.ipAddress ?? undefined,
    response: input.token,
    secret: secretKey,
  });

  // Turnstile の検証レスポンスも schema で受けて action まで確認する
  const response = await turnstileApiClient.postUrl("/siteverify", payload, {
    requestSchema: turnstileSiteVerifyRequestSchema,
    responseSchema: turnstileSiteVerifyResponseSchema,
  });

  const data = response.data!;

  if (!data.success) {
    return {
      errors: data["error-codes"] ?? ["turnstile-validation-failed"],
      success: false,
    } as const;
  }

  if (data.action && data.action !== input.expectedAction) {
    return {
      errors: ["turnstile-action-mismatch"],
      success: false,
    } as const;
  }

  return {
    errors: [] as string[],
    hostname: data.hostname ?? null,
    success: true,
  } as const;
}
