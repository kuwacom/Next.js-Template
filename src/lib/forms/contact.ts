import { sendDiscordWebhook } from "@/api/discord/webhooks";
import { verifyTurnstileToken } from "@/api/cloudflare/turnstile";
import serverEnv from "@/config/serverEnv";
import { getFormSubmissionMessage } from "@/lib/forms/messages";
import {
  contactSubmissionResultSchema,
  getContactFieldErrors,
  normalizeContactLocale,
  type ContactFormInput,
  type ContactSubmissionResult,
  type ContactSubmissionSource,
} from "@/schemas/contact";
import { discordWebhookPayloadSchema } from "@/schemas/discord";
import type { ZodError } from "zod";

type ContactSubmissionMeta = {
  ipAddress: string | null;
  origin: string | null;
  userAgent: string | null;
};

function buildContactResult(
  result: ContactSubmissionResult,
): ContactSubmissionResult {
  // 最終レスポンスを返す直前にも schema を通して形を固定する
  return contactSubmissionResultSchema.parse(result);
}

function buildDiscordPayload(
  input: ContactFormInput,
  meta: ContactSubmissionMeta,
  source: ContactSubmissionSource,
  turnstileHostname: string | null,
) {
  // Discord 通知の payload 組み立ても schema に寄せて破損を防ぐ
  return discordWebhookPayloadSchema.parse({
    avatar_url: serverEnv.DISCORD_WEBHOOK_AVATAR_URL,
    embeds: [
      {
        color: 0x2563eb,
        description: input.message,
        fields: [
          {
            inline: true,
            name: "お名前",
            value: input.name,
          },
          {
            inline: true,
            name: "メールアドレス",
            value: input.email,
          },
          {
            inline: true,
            name: "会社名",
            value: input.company || "-",
          },
          {
            inline: true,
            name: "言語",
            value: input.locale,
          },
          {
            inline: true,
            name: "送信元ページ",
            value: input.pagePath,
          },
          {
            inline: true,
            name: "送信方式",
            value: source,
          },
          {
            inline: false,
            name: "Origin",
            value: meta.origin || "-",
          },
          {
            inline: true,
            name: "IP",
            value: meta.ipAddress || "-",
          },
          {
            inline: true,
            name: "Turnstile Hostname",
            value: turnstileHostname || "-",
          },
        ],
        footer: {
          text: meta.userAgent || "user-agent unavailable",
        },
        timestamp: new Date().toISOString(),
        title: "お問い合わせを受信しました",
      },
    ],
    username: serverEnv.DISCORD_WEBHOOK_USERNAME,
  });
}

export function createContactValidationResult(
  error: ZodError,
  locale?: string | null,
) {
  const normalizedLocale = normalizeContactLocale(locale);

  return buildContactResult({
    fieldErrors: getContactFieldErrors(error, normalizedLocale),
    message: getFormSubmissionMessage(normalizedLocale, "validationError"),
    ok: false,
    resetTurnstile: false,
    status: "validation_error",
    turnstileErrors: [],
  });
}

export function createInvalidJsonResult(locale?: string | null) {
  const normalizedLocale = normalizeContactLocale(locale);

  return buildContactResult({
    fieldErrors: {},
    message: getFormSubmissionMessage(normalizedLocale, "invalidJson"),
    ok: false,
    resetTurnstile: false,
    status: "validation_error",
    turnstileErrors: [],
  });
}

export async function submitContactForm(
  input: ContactFormInput, // フォームの入力内容
  meta: ContactSubmissionMeta, // 送信元の IP アドレスや User-Agent などのメタ情報
  source: ContactSubmissionSource, // 送信方法 (例: "api-route", "server-action" など 無くてもok)
): Promise<ContactSubmissionResult> {
  try {
    // widget 表示だけでは不十分なので必ずサーバー側でも token を検証する
    const verification = await verifyTurnstileToken({
      expectedAction: "contact-form",
      ipAddress: meta.ipAddress,
      token: input.turnstileToken,
    });

    if (!verification.success) {
      return buildContactResult({
        fieldErrors: {},
        message:
          verification.errors[0] === "missing-turnstile-secret"
            ? getFormSubmissionMessage(input.locale, "configTurnstile")
            : getFormSubmissionMessage(input.locale, "turnstileError"),
        ok: false,
        resetTurnstile: true,
        status:
          verification.errors[0] === "missing-turnstile-secret"
            ? "config_error"
            : "turnstile_error",
        turnstileErrors: [...verification.errors],
      });
    }

    // 検証を通過したものだけ Discord へ転送する
    const webhookResult = await sendDiscordWebhook(
      buildDiscordPayload(input, meta, source, verification.hostname ?? null),
    );

    if (!webhookResult.ok) {
      return buildContactResult({
        fieldErrors: {},
        message:
          webhookResult.reason === "missing-discord-webhook"
            ? getFormSubmissionMessage(input.locale, "configWebhook")
            : getFormSubmissionMessage(input.locale, "discordError"),
        ok: false,
        resetTurnstile: true,
        status:
          webhookResult.reason === "missing-discord-webhook"
            ? "config_error"
            : "server_error",
        turnstileErrors: [],
      });
    }

    return buildContactResult({
      fieldErrors: {},
      message: getFormSubmissionMessage(input.locale, "success"),
      ok: true,
      resetTurnstile: true,
      status: "success",
      turnstileErrors: [],
    });
  } catch {
    return buildContactResult({
      fieldErrors: {},
      message: getFormSubmissionMessage(input.locale, "unexpectedError"),
      ok: false,
      resetTurnstile: true,
      status: "server_error",
      turnstileErrors: ["internal-error"],
    });
  }
}
