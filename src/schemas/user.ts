import { z } from "zod";

export const userRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Email format is invalid"),
});

export const userParamsSchema = z.object({
  userId: z.coerce.number().int().positive(),
});
