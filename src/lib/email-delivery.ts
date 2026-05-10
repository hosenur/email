import { z } from "zod";
import { resend } from "@/lib/resend";

export type EmailDeliveryProvider = "resend" | "cloudflare";

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType: string;
}

export interface SendOutboundEmailInput {
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  text: string;
  replyTo: string;
  attachments: EmailAttachment[];
}

export interface SendOutboundEmailResult {
  provider: EmailDeliveryProvider;
  messageId: string | null;
}

export class EmailDeliveryError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, details: unknown, status = 500) {
    super(message);
    this.name = "EmailDeliveryError";
    this.details = details;
    this.status = status;
  }
}

const CloudflareSendResponseSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
});

export function getEmailDeliveryProvider(): EmailDeliveryProvider {
  const provider = process.env.EMAIL_DELIVERY_PROVIDER?.trim().toLowerCase();

  if (provider === "cloudflare") {
    return "cloudflare";
  }

  return "resend";
}

async function sendWithResend(
  input: SendOutboundEmailInput,
): Promise<SendOutboundEmailResult> {
  const resendAttachments = input.attachments.map((attachment) => ({
    filename: attachment.filename,
    content: Buffer.from(attachment.content, "base64"),
    contentType: attachment.contentType,
  }));

  const { data, error } = await resend.emails.send({
    from: input.from,
    to: input.to,
    cc: input.cc.length > 0 ? input.cc : undefined,
    bcc: input.bcc.length > 0 ? input.bcc : undefined,
    subject: input.subject,
    text: input.text,
    replyTo: input.replyTo,
    attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
  });

  if (error) {
    throw new EmailDeliveryError("Failed to send email with Resend", error);
  }

  return {
    provider: "resend",
    messageId: data?.id ?? null,
  };
}

async function parseCloudflareResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function sendWithCloudflare(
  input: SendOutboundEmailInput,
): Promise<SendOutboundEmailResult> {
  const endpoint = process.env.CLOUDFLARE_EMAIL_OUTBOUND_URL;
  const secret = process.env.CLOUDFLARE_EMAIL_OUTBOUND_SECRET;

  if (!endpoint || !secret) {
    throw new EmailDeliveryError(
      "Cloudflare email delivery is not configured",
      {
        missing: [
          !endpoint ? "CLOUDFLARE_EMAIL_OUTBOUND_URL" : null,
          !secret ? "CLOUDFLARE_EMAIL_OUTBOUND_SECRET" : null,
        ].filter(Boolean),
      },
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: input.to,
      cc: input.cc,
      bcc: input.bcc,
      subject: input.subject,
      text: input.text,
      replyTo: input.replyTo,
      attachments: input.attachments,
    }),
  });
  const body = await parseCloudflareResponse(response);

  if (!response.ok) {
    throw new EmailDeliveryError(
      "Failed to send email with Cloudflare",
      body,
      response.status,
    );
  }

  const parsed = CloudflareSendResponseSchema.safeParse(body);

  if (!parsed.success || !parsed.data.success) {
    throw new EmailDeliveryError(
      "Invalid Cloudflare email response",
      body,
      response.status,
    );
  }

  return {
    provider: "cloudflare",
    messageId: parsed.data.messageId ?? null,
  };
}

export async function sendOutboundEmail(
  input: SendOutboundEmailInput,
): Promise<SendOutboundEmailResult> {
  const provider = getEmailDeliveryProvider();

  if (provider === "cloudflare") {
    return sendWithCloudflare(input);
  }

  return sendWithResend(input);
}
