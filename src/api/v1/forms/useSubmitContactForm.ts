"use client";

import { APIError, apiClient } from "@/api/apiClient";
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
    if (error instanceof APIError) {
      const parsed = contactSubmissionResultSchema.safeParse(error.data);

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
    Error,
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
