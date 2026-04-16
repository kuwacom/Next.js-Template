"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import type { AppLocale } from "@/i18n/routing";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/forms/TurnstileWidget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  contactSubmissionResultSchema,
  getContactFieldErrors,
  getContactFormInput,
  type ContactFieldErrors,
  type ContactSubmissionResult,
} from "@/schemas/contact";

type ActionContactFormProps = {
  locale: AppLocale;
  pagePath: string;
  siteKey?: string;
  submitAction: (
    state: ContactSubmissionResult,
    formData: FormData,
  ) => Promise<ContactSubmissionResult>;
};

const initialState = contactSubmissionResultSchema.parse({
  fieldErrors: {},
  message: "",
  ok: false,
  resetTurnstile: false,
  status: "validation_error",
  turnstileErrors: [],
});

export function ActionContactForm({
  locale,
  pagePath,
  siteKey,
  submitAction,
}: ActionContactFormProps) {
  const t = useTranslations("forms");
  const formRef = useRef<HTMLFormElement | null>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [result, setResult] = useState<ContactSubmissionResult>(initialState);
  const [state, formAction, pending] = useActionState(
    submitAction,
    initialState,
  );

  useEffect(() => {
    setResult(state);
    setFieldErrors(state.fieldErrors);
  }, [state]);

  useEffect(() => {
    if (!state.resetTurnstile) {
      return;
    }

    setTurnstileToken("");
    turnstileRef.current?.reset();

    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  function clearFieldError(fieldName: keyof ContactFieldErrors) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[fieldName]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);

    // 送信前に client 側でも同じ schema を通し、Server Action 側と判定を揃える
    const parsedInput = getContactFormInput({
      company: formData.get("company")?.toString(),
      email: formData.get("email")?.toString(),
      locale,
      message: formData.get("message")?.toString(),
      name: formData.get("name")?.toString(),
      pagePath,
      turnstileToken,
    });

    if (!parsedInput.success) {
      event.preventDefault();
      setFieldErrors(getContactFieldErrors(parsedInput.error, locale));
      setResult(initialState);
      return;
    }

    setFieldErrors({});
    setResult(initialState);
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>{t("cardActionTitle")}</CardTitle>
        <CardDescription>{t("cardActionDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={formAction}
          className="space-y-5"
          onSubmit={handleSubmit}
        >
          {/* Server Action 側で locale と送信元ページを復元できるよう hidden で渡す */}
          <input type="hidden" name="locale" value={locale} readOnly />
          <input type="hidden" name="pagePath" value={pagePath} readOnly />
          <input
            type="hidden"
            name="cf-turnstile-response"
            value={turnstileToken}
            readOnly
          />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="action-name">{t("nameLabel")}</Label>
              <Input
                id="action-name"
                name="name"
                placeholder={t("namePlaceholder")}
                aria-invalid={Boolean(fieldErrors.name)}
                onChange={() => clearFieldError("name")}
                required
              />
              {fieldErrors.name ? (
                <p className="text-sm text-destructive">{fieldErrors.name}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="action-email">{t("emailLabel")}</Label>
              <Input
                id="action-email"
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                aria-invalid={Boolean(fieldErrors.email)}
                onChange={() => clearFieldError("email")}
                required
              />
              {fieldErrors.email ? (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-company">{t("companyLabel")}</Label>
            <Input
              id="action-company"
              name="company"
              placeholder={t("companyPlaceholder")}
              aria-invalid={Boolean(fieldErrors.company)}
              onChange={() => clearFieldError("company")}
            />
            {fieldErrors.company ? (
              <p className="text-sm text-destructive">{fieldErrors.company}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-message">{t("messageLabel")}</Label>
            <Textarea
              id="action-message"
              name="message"
              placeholder={t("messagePlaceholder")}
              aria-invalid={Boolean(fieldErrors.message)}
              onChange={() => clearFieldError("message")}
              required
            />
            {fieldErrors.message ? (
              <p className="text-sm text-destructive">{fieldErrors.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>{t("botLabel")}</Label>
            <TurnstileWidget
              ref={turnstileRef}
              action="contact-form"
              copy={{
                apiUnavailable: t("turnstile.apiUnavailable"),
                expired: t("turnstile.expired"),
                initError: t("turnstile.initError"),
                loadError: t("turnstile.loadError"),
                missingSiteKey: t("turnstile.missingSiteKey"),
              }}
              onTokenChange={(token) => {
                setTurnstileToken(token);
                clearFieldError("turnstileToken");
              }}
              siteKey={siteKey}
            />
            {fieldErrors.turnstileToken ? (
              <p className="text-sm text-destructive">
                {fieldErrors.turnstileToken}
              </p>
            ) : null}
          </div>

          {result.message ? (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                result.ok
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {result.message}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={pending || !turnstileToken || !siteKey}
          >
            {pending ? t("submitActionPending") : t("submitAction")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
