import enMessages from "../../../messages/en.json";
import jaMessages from "../../../messages/ja.json";

import { type AppLocale, isValidLocale, routing } from "@/i18n/routing";

const formMessagesByLocale = {
  en: enMessages.forms,
  ja: jaMessages.forms,
} as const;

type FormMessages = (typeof formMessagesByLocale)["ja"];

export function normalizeFormLocale(locale?: string | null): AppLocale {
  return locale && isValidLocale(locale) ? locale : routing.defaultLocale;
}

function getFormMessages(locale?: string | null): FormMessages {
  // Server と client で同じ翻訳資源を参照できるよう JSON を直接束ねている
  return formMessagesByLocale[normalizeFormLocale(locale)];
}

export function getFormValidationMessage(
  locale: AppLocale,
  key: keyof FormMessages["errors"],
) {
  return getFormMessages(locale).errors[key];
}

export function getFormSubmissionMessage(
  locale: AppLocale,
  key: keyof FormMessages["messages"],
) {
  return getFormMessages(locale).messages[key];
}
