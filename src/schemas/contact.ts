import { z, type ZodError, type ZodIssue } from "zod";

import { type AppLocale, routing } from "@/i18n/routing";
import {
  getFormValidationMessage,
  normalizeFormLocale,
} from "@/lib/forms/messages";

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

export function normalizeContactLocale(locale?: string | null): AppLocale {
  return normalizeFormLocale(locale);
}

const localeEnumValues = [...routing.locales] as [AppLocale, ...AppLocale[]];

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
    z.string().max(100),
  ),
  email: z.preprocess(
    (value) => preprocessString(value),
    z.string().min(1).email(),
  ),
  locale: z.preprocess(
    (value) => normalizeContactLocale(typeof value === "string" ? value : null),
    z.enum(localeEnumValues),
  ),
  message: z.preprocess(
    (value) => preprocessString(value),
    z.string().min(1).min(10).max(2000),
  ),
  name: z.preprocess(
    (value) => preprocessString(value),
    z.string().min(1).max(80),
  ),
  pagePath: z.preprocess(
    (value) => preprocessString(value, "/"),
    z.string().min(1),
  ),
  turnstileToken: z.preprocess(
    (value) => preprocessString(value),
    z.string().min(1),
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

function getValidationMessage(
  fieldName: ContactFieldName,
  issue: ZodIssue,
  locale: AppLocale,
) {
  switch (fieldName) {
    case "company":
      return getFormValidationMessage(locale, "companyTooLong");
    case "email":
      if (issue.code === "too_small") {
        return getFormValidationMessage(locale, "emailRequired");
      }

      return getFormValidationMessage(locale, "emailInvalid");
    case "message":
      if (issue.code === "too_small") {
        return issue.minimum === 1
          ? getFormValidationMessage(locale, "messageRequired")
          : getFormValidationMessage(locale, "messageTooShort");
      }

      return getFormValidationMessage(locale, "messageTooLong");
    case "name":
      return issue.code === "too_small"
        ? getFormValidationMessage(locale, "nameRequired")
        : getFormValidationMessage(locale, "nameTooLong");
    case "turnstileToken":
      return getFormValidationMessage(locale, "turnstileRequired");
  }
}

export function getContactFieldErrors(
  error: ZodError,
  locale: AppLocale,
): ContactFieldErrors {
  const fieldErrors: ContactFieldErrors = {};

  // UI に返す都合上 各項目の先頭メッセージだけを使う
  for (const issue of error.issues) {
    const fieldName = issue.path[0];

    if (
      typeof fieldName !== "string" ||
      !contactFieldKeys.includes(fieldName as ContactFieldName)
    ) {
      continue;
    }

    const typedFieldName = fieldName as ContactFieldName;

    if (!fieldErrors[typedFieldName]) {
      fieldErrors[typedFieldName] = getValidationMessage(
        typedFieldName,
        issue,
        locale,
      );
    }
  }

  return fieldErrors;
}

export function getContactFormInput(input: {
  company?: string | null;
  email?: string | null;
  locale?: string | null;
  message?: string | null;
  name?: string | null;
  pagePath?: string | null;
  turnstileToken?: string | null;
}) {
  // safeParse を返してクライアントとサーバーの両方で同じ分岐を書けるようにする
  return contactFormSchema.safeParse({
    company: input.company,
    email: input.email,
    locale: input.locale,
    message: input.message,
    name: input.name,
    pagePath: input.pagePath,
    turnstileToken: input.turnstileToken,
  });
}
