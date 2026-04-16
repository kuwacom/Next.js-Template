import { z, type ZodError } from "zod";

const contactFieldKeys = [
  "company",
  "email",
  "message",
  "name",
  "turnstileToken",
] as const;

function preprocessString(value: unknown, fallback = "") {
  // フォーム入力は先に trim してから同じルールで検証する
  if (typeof value === "string") {
    return value.trim();
  }

  return fallback;
}

export const contactSubmissionStatusSchema = z.enum([
  "config_error",
  "server_error",
  "success",
  "turnstile_error",
  "validation_error",
]);

export const contactSubmissionSourceSchema = z.enum(["api", "server-action"]);

export const contactFieldErrorsSchema = z
  .object({
    company: z.string(),
    email: z.string(),
    message: z.string(),
    name: z.string(),
    turnstileToken: z.string(),
  })
  .partial();

export const contactFormSchema = z.object({
  company: z.preprocess(
    (value) => preprocessString(value),
    z.string().max(100, "会社名は 100 文字以内で入力してください。"),
  ),
  email: z.preprocess(
    (value) => preprocessString(value),
    z
      .string()
      .min(1, "メールアドレスは必須です。")
      .email("メールアドレスの形式が正しくありません。"),
  ),
  message: z.preprocess(
    (value) => preprocessString(value),
    z
      .string()
      .min(1, "お問い合わせ内容は必須です。")
      .min(10, "お問い合わせ内容は 10 文字以上で入力してください。")
      .max(2000, "お問い合わせ内容は 2000 文字以内で入力してください。"),
  ),
  name: z.preprocess(
    (value) => preprocessString(value),
    z
      .string()
      .min(1, "お名前は必須です。")
      .max(80, "お名前は 80 文字以内で入力してください。"),
  ),
  pagePath: z.preprocess(
    (value) => preprocessString(value, "/"),
    z.string().min(1, "送信元ページが不正です。"),
  ),
  turnstileToken: z.preprocess(
    (value) => preprocessString(value),
    z.string().min(1, "BOT 対策の確認を完了してください。"),
  ),
});

// API 版も Server Action 版も同じ入力 schema を使う
export const contactApiRequestSchema = contactFormSchema;

export const contactSubmissionResultSchema = z.object({
  fieldErrors: contactFieldErrorsSchema,
  message: z.string(),
  ok: z.boolean(),
  resetTurnstile: z.boolean(),
  status: contactSubmissionStatusSchema,
  turnstileErrors: z.array(z.string()),
});

export type ContactFieldName = (typeof contactFieldKeys)[number];
export type ContactFieldErrors = z.infer<typeof contactFieldErrorsSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ContactSubmissionResult = z.infer<
  typeof contactSubmissionResultSchema
>;
export type ContactSubmissionStatus = z.infer<
  typeof contactSubmissionStatusSchema
>;
export type ContactSubmissionSource = z.infer<
  typeof contactSubmissionSourceSchema
>;

export function getContactFieldErrors(error: ZodError): ContactFieldErrors {
  const flattenedErrors = error.flatten().fieldErrors as Partial<
    Record<ContactFieldName, string[] | undefined>
  >;
  const fieldErrors: ContactFieldErrors = {};

  // UI に返す都合上 各項目の先頭メッセージだけを使う
  for (const key of contactFieldKeys) {
    const message = flattenedErrors[key]?.[0];

    if (message) {
      fieldErrors[key] = message;
    }
  }

  return fieldErrors;
}

export function getContactFormInput(input: {
  company?: string | null;
  email?: string | null;
  message?: string | null;
  name?: string | null;
  pagePath?: string | null;
  turnstileToken?: string | null;
}) {
  // safeParse を返してクライアントとサーバーの両方で同じ分岐を書けるようにする
  return contactFormSchema.safeParse({
    company: input.company,
    email: input.email,
    message: input.message,
    name: input.name,
    pagePath: input.pagePath,
    turnstileToken: input.turnstileToken,
  });
}
