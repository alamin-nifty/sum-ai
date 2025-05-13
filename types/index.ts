import { z } from "zod";

// API Response Types
export const SummaryResponseSchema = z.object({
  summary: z.string(),
  tasks: z.array(z.string()),
});

export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;

// API Request Types
export const SummarizeRequestSchema = z.object({
  text: z.string().min(1),
  source: z.enum(["gmail", "slack", "teams", "other"]),
  metadata: z
    .object({
      threadId: z.string().optional(),
      messageId: z.string().optional(),
      channelId: z.string().optional(),
    })
    .optional(),
});

export type SummarizeRequest = z.infer<typeof SummarizeRequestSchema>;

// Integration Types
export type IntegrationType = "asana" | "todoist";

export const IntegrationConfigSchema = z.object({
  type: z.enum(["asana", "todoist"]),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.date(),
});

export type IntegrationConfig = z.infer<typeof IntegrationConfigSchema>;

// Subscription Types
export type SubscriptionStatus = "free" | "pro";

export const SubscriptionSchema = z.object({
  status: z.enum(["free", "pro"]),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

// Usage Types
export const UsageSchema = z.object({
  summariesThisMonth: z.number(),
  lastSummaryDate: z.date().optional(),
});

export type Usage = z.infer<typeof UsageSchema>;
