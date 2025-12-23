import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import { mistral } from "@/lib/mistral";
import { EmailCategory } from "@/generated/prisma/enums";

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
      try {
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
      } catch (e) {
        console.error("Failed to parse JSON content:", e);
      }
    }

    return null;
  } catch (error) {
    console.error("Mistral API Error:", error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parseResult = ResendPayloadSchema.safeParse(req.body);

  if (!parseResult.success) {
    console.error("Invalid payload:", parseResult.error);
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parseResult.error });
  }

  const payload = parseResult.data;

  try {
    const { data: email } = await resend.emails.receiving.get(
      payload.data.email_id,
    );

    const emailParseResult = FetchedEmailSchema.safeParse(email);

    if (!emailParseResult.success) {
      console.error(
        "Invalid email data fetched from Resend:",
        emailParseResult.error,
      );
      console.log("Failed data:", JSON.stringify(email, null, 2));
      return res.status(500).json({
        error: "Invalid email data from provider",
        details: emailParseResult.error,
      });
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
      console.log(
        `No registered recipients found for: ${uniqueRecipients.join(", ")}`,
      );
      return res.status(200).json({
        message: "Email skipped - no registered recipients",
        recipients: uniqueRecipients,
      });
    }

    console.log("--- Email Body ---");
    console.log(JSON.stringify(fetchedEmail, null, 2));
    console.log("HTML:", fetchedEmail.html);
    console.log("Text:", fetchedEmail.text);
    console.log("------------------");

    const content = fetchedEmail.text || fetchedEmail.html || "No content";

    const analysis = await analyzeEmail(fetchedEmail.subject, content);

    console.log("--- AI Analysis ---");
    console.log(JSON.stringify(analysis, null, 2));
    console.log("-------------------");

    let category: EmailCategory = EmailCategory.Other;
    if (analysis && analysis.category) {
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
            category: category,
            confidence: analysis?.confidence || 0,
            summary: analysis?.summary || null,
            actionItems: analysis?.actionItems || [],
          },
        }),
      ),
    );

    console.log(
      `Email saved for ${savedEmails.length} recipients:`,
      savedEmails.map((e) => e.recipient),
    );

    return res.status(200).json({ analysis, savedEmails });
  } catch (error) {
    console.error("Error processing email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
