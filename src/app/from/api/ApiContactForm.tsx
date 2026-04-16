"use client";

import { useRef, useState } from "react";

import { useSubmitContactForm } from "@/api/v1/forms";
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

const initialState = contactSubmissionResultSchema.parse({
  fieldErrors: {},
  message: "",
  ok: false,
  resetTurnstile: false,
  status: "validation_error",
  turnstileErrors: [],
});

type ApiContactFormProps = {
  siteKey?: string;
};

export function ApiContactForm({ siteKey }: ApiContactFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [state, setState] = useState<ContactSubmissionResult>(initialState);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const { isMutating, submitContactForm } = useSubmitContactForm();

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsedInput = getContactFormInput({
      company: formData.get("company")?.toString(),
      email: formData.get("email")?.toString(),
      message: formData.get("message")?.toString(),
      name: formData.get("name")?.toString(),
      pagePath: "/from/api",
      turnstileToken,
    });

    if (!parsedInput.success) {
      setFieldErrors(getContactFieldErrors(parsedInput.error));
      setState(initialState);
      return;
    }

    setFieldErrors({});
    setState(initialState);

    try {
      const result = await submitContactForm(parsedInput.data);

      setState(result);
      setFieldErrors(result.fieldErrors);

      if (result.resetTurnstile) {
        setTurnstileToken("");
        turnstileRef.current?.reset();
      }

      if (result.ok) {
        formRef.current?.reset();
        setFieldErrors({});
      }
    } catch {
      const fallbackState = contactSubmissionResultSchema.parse({
        fieldErrors: {},
        message:
          "API への送信に失敗しました。エンドポイント設定を確認してください。",
        ok: false,
        resetTurnstile: true,
        status: "server_error",
        turnstileErrors: ["request-failed"],
      });

      setState(fallbackState);

      if (fallbackState.resetTurnstile) {
        setTurnstileToken("");
        turnstileRef.current?.reset();
      }
    }
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>API フォーム</CardTitle>
        <CardDescription>
          `fetch` 相当の API
          クライアントでエンドポイントへ送信するため、フロントと API
          を別ホストに分ける構成でも流用できます。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="api-name">お名前</Label>
              <Input
                id="api-name"
                name="name"
                placeholder="山田 太郎"
                aria-invalid={Boolean(fieldErrors.name)}
                onChange={() => clearFieldError("name")}
                required
              />
              {fieldErrors.name ? (
                <p className="text-sm text-destructive">{fieldErrors.name}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-email">メールアドレス</Label>
              <Input
                id="api-email"
                name="email"
                type="email"
                placeholder="contact@example.com"
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
            <Label htmlFor="api-company">会社名</Label>
            <Input
              id="api-company"
              name="company"
              placeholder="Example Inc."
              aria-invalid={Boolean(fieldErrors.company)}
              onChange={() => clearFieldError("company")}
            />
            {fieldErrors.company ? (
              <p className="text-sm text-destructive">{fieldErrors.company}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-message">お問い合わせ内容</Label>
            <Textarea
              id="api-message"
              name="message"
              placeholder="ご相談内容を入力してください。"
              aria-invalid={Boolean(fieldErrors.message)}
              onChange={() => clearFieldError("message")}
              required
            />
            {fieldErrors.message ? (
              <p className="text-sm text-destructive">{fieldErrors.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>BOT 対策</Label>
            <TurnstileWidget
              ref={turnstileRef}
              action="contact-form"
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

          {state.message ? (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                state.ok
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isMutating || !turnstileToken || !siteKey}
          >
            {isMutating ? "送信中..." : "API 経由で送信"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
