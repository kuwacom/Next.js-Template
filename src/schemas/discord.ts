import { z } from "zod";

export const discordWebhookFieldSchema = z.object({
  inline: z.boolean().optional(),
  name: z.string().min(1).max(256),
  value: z.string().min(1).max(1024),
});

export const discordWebhookEmbedSchema = z.object({
  color: z.number().int().min(0).max(0xffffff).optional(),
  description: z.string().max(4096).optional(),
  fields: z.array(discordWebhookFieldSchema).max(25).optional(),
  footer: z
    .object({
      text: z.string().min(1).max(2048),
    })
    .optional(),
  timestamp: z.string().datetime().optional(),
  title: z.string().min(1).max(256).optional(),
});

export const discordWebhookPayloadSchema = z.object({
  avatar_url: z.string().url().optional(),
  embeds: z.array(discordWebhookEmbedSchema).max(10).optional(),
  username: z.string().min(1).max(80).optional(),
});

export type DiscordWebhookPayload = z.infer<typeof discordWebhookPayloadSchema>;
