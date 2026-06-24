import { defineHandler, HTTPError } from "nitro";
import { z } from "zod";
import { EmailCategory } from "@/generated/prisma/enums";
import { prisma } from "@/server/lib/db";
import { mistral } from "@/server/lib/mistral";
import { resend } from "@/server/lib/resend";

function extractEmail(from: string): string {
  const match = from.match(/<(.+?)>$/);
  if (match) {
    return match[1];
  }
  return from;
}

const ResendPayloadSchema = z.object({
  created_at: z.string(),
  data: z.object({
    attachments: z.array(z.any()),
    bcc: z.array(z.string()),
    cc: z.array(z.string()),
    created_at: z.string(),
    email_id: z.string(),
    from: z.string(),
    message_id: z.string(),
    subject: z.string(),
    to: z.array(z.string()),
  }),
  type: z.literal("email.received"),
});

const FetchedEmailSchema = z.object({
  object: z.literal("email"),
  id: z.string(),
  to: z.array(z.string()).min(1),
  from: z.string(),
  created_at: z.string(),
  subject: z.string(),
  message_id: z.string().optional(),
  bcc: z.array(z.string()).optional().default([]),
  cc: z.array(z.string()).optional().default([]),
  reply_to: z.array(z.string()).optional().default([]),
  html: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  headers: z.record(z.string(), z.any()),
  attachments: z.array(z.any()).default([]),
});

async function analyzeEmail(subject: string, content: string) {
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

    if (chatResponse.choices?.[0]?.message?.content) {
      const rawContent = chatResponse.choices[0].message.content;
      const jsonString =
        typeof rawContent === "string"
          ? rawContent
          : Array.isArray(rawContent)
            ? rawContent
                .map((chunk) => ("text" in chunk ? chunk.text : ""))
                .join("")
            : String(rawContent);

      return JSON.parse(jsonString);
    }

    return null;
  } catch (error) {
    console.error("Mistral API Error:", error);
    return null;
  }
}

export default defineHandler(async (event) => {
  const parseResult = ResendPayloadSchema.safeParse(await event.req.json());

  if (!parseResult.success) {
    console.error("Invalid payload:", parseResult.error);
    throw HTTPError.status(400, "Invalid payload");
  }

  const payload = parseResult.data;

  const { data: email } = await resend.emails.receiving.get(
    payload.data.email_id,
  );

  const emailParseResult = FetchedEmailSchema.safeParse(email);

  if (!emailParseResult.success) {
    console.error(
      "Invalid email data fetched from Resend:",
      emailParseResult.error,
    );
    throw HTTPError.status(500, "Invalid email data from provider");
  }

  const fetchedEmail = emailParseResult.data;
  const allRecipients = [
    ...fetchedEmail.to.map(extractEmail),
    ...fetchedEmail.cc.map(extractEmail),
    ...fetchedEmail.bcc.map(extractEmail),
  ];
  const uniqueRecipients = [...new Set(allRecipients)];

  const registeredUsers = await prisma.user.findMany({
    where: { email: { in: uniqueRecipients } },
    select: { email: true },
  });

  if (registeredUsers.length === 0) {
    return {
      message: "Email skipped - no registered recipients",
      recipients: uniqueRecipients,
    };
  }

  const content = fetchedEmail.text || fetchedEmail.html || "No content";
  const analysis = await analyzeEmail(fetchedEmail.subject, content);

  let category: EmailCategory = EmailCategory.Other;
  if (analysis?.category) {
    const aiCategory = analysis.category as keyof typeof EmailCategory;
    if (Object.values(EmailCategory).includes(EmailCategory[aiCategory])) {
      category = EmailCategory[aiCategory];
    }
  }

  const baseMessageId = fetchedEmail.message_id || payload.data.message_id;

  const savedEmails = await Promise.all(
    registeredUsers.map((user, index) =>
      prisma.email.create({
        data: {
          messageId:
            index === 0 ? baseMessageId : `${baseMessageId}-${user.email}`,
          from: fetchedEmail.from,
          fromEmail: extractEmail(fetchedEmail.from),
          to: fetchedEmail.to,
          bcc: fetchedEmail.bcc,
          cc: fetchedEmail.cc,
          recipient: user.email,
          subject: fetchedEmail.subject,
          textBody: fetchedEmail.text || null,
          htmlBody: fetchedEmail.html || null,
          receivedAt: new Date(fetchedEmail.created_at),
          replyTo: fetchedEmail.reply_to,
          opened: false,
          category,
          confidence: analysis?.confidence || 0,
          summary: analysis?.summary || null,
          actionItems: analysis?.actionItems || [],
        },
      }),
    ),
  );

  return { analysis, savedEmails };
});
