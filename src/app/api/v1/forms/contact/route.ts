import { NextRequest, NextResponse } from "next/server";

import {
  createContactValidationResult,
  createInvalidJsonResult,
  submitContactForm,
} from "@/lib/forms/contact";
import { apiHandler } from "@/lib/apiError";
import { getClientIp } from "@/lib/utils";
import { getContactFormInput } from "@/schemas/contact";

export const POST = apiHandler(async (request: NextRequest) => {
  const body = (await request.json().catch(() => null)) as {
    company?: string | null;
    email?: string | null;
    locale?: string | null;
    message?: string | null;
    name?: string | null;
    pagePath?: string | null;
    turnstileToken?: string | null;
  } | null;

  if (!body) {
    // JSON が壊れているケースも UI と同じ翻訳資源の文言で返す
    return NextResponse.json(createInvalidJsonResult(), {
      status: 400,
    });
  }

  // API 版の JSON も UI と同じ schema で確定させる
  const parsedInput = getContactFormInput({
    company: body.company,
    email: body.email,
    locale: body.locale,
    message: body.message,
    name: body.name,
    pagePath: body.pagePath || "/forms/api",
    turnstileToken: body.turnstileToken,
  });

  const result = !parsedInput.success
    ? createContactValidationResult(parsedInput.error, body.locale)
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
});
