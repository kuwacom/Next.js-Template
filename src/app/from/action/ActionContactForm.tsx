"use client";

import { useActionState, useEffect, useRef, useState } from "react";

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

type ActionContactFormProps = {
  submitAction: (
    state: ContactSubmissionResult,
    formData: FormData,
  ) => Promise<ContactSubmissionResult>;
  siteKey?: string;
};

export function ActionContactForm({
  submitAction,
  siteKey,
}: ActionContactFormProps) {
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
    const parsedInput = getContactFormInput({
      company: formData.get("company")?.toString(),
      email: formData.get("email")?.toString(),
      message: formData.get("message")?.toString(),
      name: formData.get("name")?.toString(),
      pagePath: "/from/action",
      turnstileToken,
    });

    if (!parsedInput.success) {
      event.preventDefault();
      setFieldErrors(getContactFieldErrors(parsedInput.error));
      setResult(initialState);
      return;
    }

    setFieldErrors({});
    setResult(initialState);
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Server Action フォーム</CardTitle>
        <CardDescription>
          Next.js の Server Action で受け取り、Turnstile を検証してから Discord
          Webhook を呼び出します。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={formAction}
          className="space-y-5"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="action-name">お名前</Label>
              <Input
                id="action-name"
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
              <Label htmlFor="action-email">メールアドレス</Label>
              <Input
                id="action-email"
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
            <Label htmlFor="action-company">会社名</Label>
            <Input
              id="action-company"
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
            <Label htmlFor="action-message">お問い合わせ内容</Label>
            <Textarea
              id="action-message"
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

          <input
            type="hidden"
            name="cf-turnstile-response"
            value={turnstileToken}
            readOnly
          />

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
            {pending ? "送信中..." : "Server Action で送信"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
