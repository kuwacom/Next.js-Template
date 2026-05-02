"use client";

import { apiClient } from "@/api/apiClient";
import { ApiResultError } from "@/lib/apiError";
import {
  contactApiRequestSchema,
  contactSubmissionResultSchema,
} from "@/schemas/contact";
import {
  ContactFormRequest,
  ContactSubmissionResult,
} from "@/types/v1/api";
import useSWRMutation from "swr/mutation";

const submitContactFormKey = () => ["forms", "contact", "submit"] as const;

async function submitContactFormRequest(
  input: ContactFormRequest,
): Promise<ContactSubmissionResult> {
  try {
    const response = await apiClient.post<
      ContactSubmissionResult,
      ContactSubmissionResult,
      ContactFormRequest
    >("/forms/contact", input, {
      requestSchema: contactApiRequestSchema,
      responseSchema: contactSubmissionResultSchema,
    });

    return response.data!;
  } catch (error) {
    if (error instanceof ApiResultError) {
      const parsed = contactSubmissionResultSchema.safeParse(error.details);

      if (parsed.success) {
        return parsed.data;
      }
    }

    throw error;
  }
}

export function useSubmitContactForm() {
  const mutation = useSWRMutation<
    ContactSubmissionResult,
    ApiResultError | Error,
    ReturnType<typeof submitContactFormKey>,
    ContactFormRequest
  >(submitContactFormKey(), async (_key, { arg }) =>
    submitContactFormRequest(arg),
  );

  const submitContactForm = async (input: ContactFormRequest) =>
    mutation.trigger(input);

  return {
    ...mutation,
    submitContactForm,
  };
}
