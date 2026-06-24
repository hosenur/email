import { defineHandler } from "nitro";
import { prisma } from "@/server/lib/db";
import { mistral } from "@/server/lib/mistral";
import { requireTenantUser } from "@/server/lib/session";

async function generateTldr(
  emails: { from: string; subject: string | null; summary: string | null }[],
) {
  try {
    const emailSummaries = emails
      .map(
        (email, index) =>
          `${index + 1}. From: ${email.from}\n   Subject: ${email.subject}\n   Summary: ${email.summary || "No summary available"}`,
      )
      .join("\n\n");

    const chatResponse = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content:
            "You are an email assistant. Generate a brief, friendly TLDR summary of the user's unread emails. Keep it concise (2-4 sentences max). Focus on what's most important or actionable. Use a casual, helpful tone.",
        },
        {
          role: "user",
          content: `Here are my ${emails.length} unread emails:\n\n${emailSummaries}\n\nGive me a quick TLDR of what I need to know.`,
        },
      ],
    });

    if (chatResponse.choices?.[0]?.message?.content) {
      const content = chatResponse.choices[0].message.content;
      return typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map((chunk) => ("text" in chunk ? chunk.text : "")).join("")
          : String(content);
    }

    return null;
  } catch (error) {
    console.error("Mistral API Error:", error);
    return null;
  }
}

export default defineHandler(async (event) => {
  const user = await requireTenantUser(event);

  const unopenedEmails = await prisma.email.findMany({
    where: {
      recipient: user.email,
      opened: false,
    },
    orderBy: { receivedAt: "desc" },
    take: 5,
    select: {
      id: true,
      from: true,
      subject: true,
      summary: true,
      receivedAt: true,
    },
  });

  if (unopenedEmails.length === 0) {
    return {
      count: 0,
      message: "No unread emails",
      tldr: null,
    };
  }

  let tldr = await generateTldr(unopenedEmails);

  if (!tldr && unopenedEmails.length > 0) {
    const summaries = unopenedEmails
      .filter((email) => email.summary)
      .map((email) => `${email.subject}: ${email.summary}`)
      .join(" ");
    tldr = summaries || null;
  }

  return {
    count: unopenedEmails.length,
    emails: unopenedEmails,
    tldr,
  };
});
