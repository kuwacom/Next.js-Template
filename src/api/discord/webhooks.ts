import { createApiClient } from "@/api/apiClient";
import {
  discordWebhookPayloadSchema,
  type DiscordWebhookPayload,
} from "@/schemas/discord";

export async function sendDiscordWebhook(payload: DiscordWebhookPayload) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      ok: false,
      reason: "missing-discord-webhook",
    } as const;
  }

  const validatedPayload = discordWebhookPayloadSchema.parse(payload);
  const discordWebhookClient = createApiClient({
    baseUrl: webhookUrl,
    timeout: 10000,
    useAuth: false,
  });

  // Webhook URL は秘密情報なので常にサーバー側からだけ呼ぶ
  await discordWebhookClient.postUrl("", validatedPayload);

  return {
    ok: true,
  } as const;
}
