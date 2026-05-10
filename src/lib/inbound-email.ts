import { EmailCategory } from "@/generated/prisma/enums";
import { mistral } from "@/lib/mistral";
import { prisma } from "@/lib/prisma";

const emailCategoryValues = new Set<EmailCategory>(
  Object.values(EmailCategory),
);

export type InboundEmailProvider = "resend" | "cloudflare";

export interface NormalizedInboundEmail {
  provider: InboundEmailProvider;
  providerMessageId?: string | null;
  messageId?: string | null;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string[];
  subject?: string | null;
  text?: string | null;
  html?: string | null;
  receivedAt?: Date | string | null;
}

export interface EmailAnalysis {
  category?: string;
  confidence?: number;
  summary?: string | null;
  actionItems?: string[];
}

type SavedEmail = Awaited<ReturnType<typeof prisma.email.create>>;

export interface ProcessInboundEmailResult {
  analysis: EmailAnalysis | null;
  recipients: string[];
  savedEmails: SavedEmail[];
  message: string;
}

export function extractEmailAddress(value: string): string {
  const match = value.match(/<(.+?)>$/);
  return (match?.[1] ?? value).trim().toLowerCase();
}

async function analyzeEmail(
  subject: string,
  content: string,
): Promise<EmailAnalysis | null> {
  try {
    const chatResponse = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content:
            "Analyze the incoming email. Classify it, summarize it, and extract any action items. Return the result as a JSON object with the keys: 'category' (one of Work, Personal, Finance, Social, Promotions, Updates, Spam, Other), 'confidence' (number 0-1), 'summary' (string), and 'actionItems' (array of strings).",
        },
        {
          role: "user",
          content: `Subject: ${subject}\n\nBody:\n${content}`,
        },
      ],
      responseFormat: { type: "json_object" },
    });

    const rawContent = chatResponse.choices?.[0]?.message?.content;

    if (!rawContent) {
      return null;
    }

    const jsonString =
      typeof rawContent === "string"
        ? rawContent
        : Array.isArray(rawContent)
          ? rawContent
              .map((chunk) => ("text" in chunk ? chunk.text : ""))
              .join("")
          : String(rawContent);

    const parsed = JSON.parse(jsonString) as EmailAnalysis;

    return {
      category: parsed.category,
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : undefined,
      summary: typeof parsed.summary === "string" ? parsed.summary : null,
      actionItems: Array.isArray(parsed.actionItems)
        ? parsed.actionItems.filter((item) => typeof item === "string")
        : [],
    };
  } catch (error) {
    console.error("Mistral API Error:", error);
    return null;
  }
}

function resolveCategory(analysis: EmailAnalysis | null): EmailCategory {
  const category = analysis?.category as EmailCategory | undefined;

  if (category && emailCategoryValues.has(category)) {
    return category;
  }

  return EmailCategory.Other;
}

function parseReceivedAt(value: Date | string | null | undefined): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string") {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
}

function getBaseMessageId(email: NormalizedInboundEmail): string {
  const messageId = email.messageId?.trim() || email.providerMessageId?.trim();

  if (messageId) {
    return messageId;
  }

  return `${email.provider}:${Date.now()}:${crypto.randomUUID()}`;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

async function createOrFindEmail(
  data: Parameters<typeof prisma.email.create>[0]["data"],
): Promise<SavedEmail> {
  try {
    return await prisma.email.create({ data });
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const existingEmail = await prisma.email.findUnique({
      where: { messageId: data.messageId },
    });

    if (!existingEmail) {
      throw error;
    }

    return existingEmail;
  }
}

export async function processInboundEmail(
  email: NormalizedInboundEmail,
): Promise<ProcessInboundEmailResult> {
  const allRecipients = [
    ...(email.to ?? []),
    ...(email.cc ?? []),
    ...(email.bcc ?? []),
  ].map(extractEmailAddress);
  const recipients = [...new Set(allRecipients.filter(Boolean))];

  const registeredUsers = await prisma.user.findMany({
    where: { email: { in: recipients } },
    select: { email: true },
  });

  if (registeredUsers.length === 0) {
    console.log(`No registered recipients found for: ${recipients.join(", ")}`);

    return {
      analysis: null,
      recipients,
      savedEmails: [],
      message: "Email skipped - no registered recipients",
    };
  }

  const subject = email.subject || "No subject";
  const content = email.text || email.html || "No content";
  const analysis = await analyzeEmail(subject, content);
  const category = resolveCategory(analysis);
  const baseMessageId = getBaseMessageId(email);
  const receivedAt = parseReceivedAt(email.receivedAt);
  const fromEmail = extractEmailAddress(email.from);
  const to = email.to ?? [];
  const cc = email.cc ?? [];
  const bcc = email.bcc ?? [];
  const replyTo = email.replyTo ?? [];

  const savedEmails = await Promise.all(
    registeredUsers.map((user, index) => {
      const messageId =
        index === 0 ? baseMessageId : `${baseMessageId}-${user.email}`;

      return createOrFindEmail({
        messageId,
        from: email.from,
        fromEmail,
        to,
        bcc,
        cc,
        recipient: user.email,
        subject,
        textBody: email.text || null,
        htmlBody: email.html || null,
        receivedAt,
        replyTo,
        opened: false,
        category,
        confidence: analysis?.confidence ?? 0,
        summary: analysis?.summary || null,
        actionItems: analysis?.actionItems ?? [],
      });
    }),
  );

  console.log(
    `Email saved for ${savedEmails.length} recipients:`,
    savedEmails.map((savedEmail) => savedEmail.recipient),
  );

  return {
    analysis,
    recipients,
    savedEmails,
    message: `Email saved for ${savedEmails.length} recipients`,
  };
}
