"use server";

import { headers } from "next/headers";

import {
  createContactValidationResult,
  submitContactForm,
} from "@/lib/forms/contact";
import { getClientIp } from "@/lib/utils";
import {
  getContactFormInput,
  type ContactSubmissionResult,
} from "@/schemas/contact";

export async function submitContactAction(
  _prevState: ContactSubmissionResult,
  formData: FormData,
): Promise<ContactSubmissionResult> {
  const requestHeaders = await headers();
  const parsedInput = getContactFormInput({
    company: formData.get("company")?.toString(),
    email: formData.get("email")?.toString(),
    message: formData.get("message")?.toString(),
    name: formData.get("name")?.toString(),
    pagePath: "/from/action",
    turnstileToken: formData.get("cf-turnstile-response")?.toString(),
  });

  // Server Action 版も API 版と同じ schema を使って入力を確定する
  const result = !parsedInput.success
    ? createContactValidationResult(parsedInput.error)
    : await submitContactForm(
        parsedInput.data,
        {
          ipAddress: getClientIp(requestHeaders),
          origin: requestHeaders.get("origin"),
          userAgent: requestHeaders.get("user-agent"),
        },
        "server-action",
      );

  return result;
}
