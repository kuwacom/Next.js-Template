import { NextRequest, NextResponse } from "next/server";

import {
  createContactValidationResult,
  submitContactForm,
} from "@/lib/forms/contact";
import { getClientIp } from "@/lib/utils";
import {
  contactSubmissionResultSchema,
  getContactFormInput,
} from "@/schemas/contact";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    company?: string | null;
    email?: string | null;
    message?: string | null;
    name?: string | null;
    pagePath?: string | null;
    turnstileToken?: string | null;
  } | null;

  if (!body) {
    return NextResponse.json(
      contactSubmissionResultSchema.parse({
        fieldErrors: {},
        message: "JSON ボディの読み取りに失敗しました。",
        ok: false,
        resetTurnstile: false,
        status: "validation_error",
        turnstileErrors: [],
      }),
      {
        status: 400,
      },
    );
  }

  // API 版の JSON も UI と同じ schema で確定させる
  const parsedInput = getContactFormInput({
    company: body.company,
    email: body.email,
    message: body.message,
    name: body.name,
    pagePath: body.pagePath || "/from/api",
    turnstileToken: body.turnstileToken,
  });

  const result = !parsedInput.success
    ? createContactValidationResult(parsedInput.error)
    : await submitContactForm(
        parsedInput.data,
        {
          ipAddress: getClientIp(request.headers),
          origin: request.headers.get("origin"),
          userAgent: request.headers.get("user-agent"),
        },
        "api",
      );

  // 入力不備と Turnstile 失敗は 400 それ以外の内部失敗は 500 に分ける
  const status =
    result.status === "success"
      ? 200
      : result.status === "validation_error" ||
          result.status === "turnstile_error"
        ? 400
        : 500;

  return NextResponse.json(result, {
    status,
  });
}
