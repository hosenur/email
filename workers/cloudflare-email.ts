import PostalMime, { type Address } from "postal-mime";

interface Env {
  EMAIL: SendEmail;
  CLOUDFLARE_EMAIL_WEBHOOK_URL: string;
  CLOUDFLARE_EMAIL_WEBHOOK_SECRET: string;
  CLOUDFLARE_EMAIL_FORWARD_TO?: string;
  CLOUDFLARE_EMAIL_OUTBOUND_SECRET?: string;
}

interface OutboundAttachment {
  filename: string;
  content: string;
  contentType: string;
}

interface OutboundEmailRequest {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  attachments?: OutboundAttachment[];
}

function isGroupAddress(
  address: Address,
): address is Extract<Address, { group: { name: string; address: string }[] }> {
  return "group" in address && Array.isArray(address.group);
}

function formatSingleAddress(address: Address): string | null {
  if (!address.address) {
    return null;
  }

  return formatMailbox(address.name, address.address);
}

function formatAddress(address: Address): string[] {
  if (isGroupAddress(address)) {
    return address.group.map((groupAddress) =>
      formatMailbox(groupAddress.name, groupAddress.address),
    );
  }

  const formattedAddress = formatSingleAddress(address);
  return formattedAddress ? [formattedAddress] : [];
}

function formatMailbox(name: string | undefined, email: string): string {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return email;
  }

  return `${trimmedName} <${email}>`;
}

function formatAddressList(addresses: Address[] | undefined): string[] {
  return (addresses ?? []).flatMap(formatAddress);
}

function getHeaders(
  headers: { key: string; value: string }[],
): Record<string, string> {
  return Object.fromEntries(
    headers.map((header) => [header.key, header.value]),
  );
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

function parseMailboxInput(value: string): string | EmailAddress {
  const match = value.trim().match(/^(.*?)\s*<([^>]+)>$/);

  if (!match) {
    return value.trim();
  }

  return {
    name: match[1].trim().replace(/^"|"$/g, ""),
    email: match[2].trim(),
  };
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function parseOutboundRequest(value: unknown): OutboundEmailRequest | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as Record<string, unknown>;

  if (
    typeof payload.from !== "string" ||
    !isStringArray(payload.to) ||
    typeof payload.subject !== "string"
  ) {
    return null;
  }

  const cc = payload.cc === undefined ? undefined : payload.cc;
  const bcc = payload.bcc === undefined ? undefined : payload.bcc;
  const attachments =
    payload.attachments === undefined ? undefined : payload.attachments;

  if (
    (cc !== undefined && !isStringArray(cc)) ||
    (bcc !== undefined && !isStringArray(bcc)) ||
    (payload.text !== undefined && typeof payload.text !== "string") ||
    (payload.html !== undefined && typeof payload.html !== "string") ||
    (payload.replyTo !== undefined && typeof payload.replyTo !== "string") ||
    (attachments !== undefined &&
      (!Array.isArray(attachments) ||
        !attachments.every(
          (attachment) =>
            attachment &&
            typeof attachment === "object" &&
            typeof (attachment as OutboundAttachment).filename === "string" &&
            typeof (attachment as OutboundAttachment).content === "string" &&
            typeof (attachment as OutboundAttachment).contentType === "string",
        )))
  ) {
    return null;
  }

  return {
    from: payload.from,
    to: payload.to,
    cc,
    bcc,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    replyTo: payload.replyTo,
    attachments: attachments as OutboundAttachment[] | undefined,
  };
}

async function postInboundWebhook(
  message: ForwardableEmailMessage,
  env: Env,
): Promise<Response> {
  const rawEmail = new Response(message.raw);
  const parsedEmail = await PostalMime.parse(await rawEmail.arrayBuffer(), {
    attachmentEncoding: "base64",
  });
  const headers = getHeaders(parsedEmail.headers);
  const payload = {
    provider: "cloudflare",
    envelope: {
      from: message.from,
      to: message.to,
    },
    rawSize: message.rawSize,
    email: {
      messageId: parsedEmail.messageId || headers["message-id"] || null,
      from:
        parsedEmail.from !== undefined
          ? formatSingleAddress(parsedEmail.from)
          : message.from,
      to: formatAddressList(parsedEmail.to),
      cc: formatAddressList(parsedEmail.cc),
      bcc: formatAddressList(parsedEmail.bcc),
      replyTo: formatAddressList(parsedEmail.replyTo),
      subject: parsedEmail.subject || null,
      text: parsedEmail.text || null,
      html: parsedEmail.html || null,
      date: parsedEmail.date || null,
      headers,
    },
  };

  return fetch(env.CLOUDFLARE_EMAIL_WEBHOOK_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.CLOUDFLARE_EMAIL_WEBHOOK_SECRET}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

async function forwardOriginalEmail(
  message: ForwardableEmailMessage,
  forwardTo: string | undefined,
): Promise<void> {
  if (!forwardTo) {
    return;
  }

  const headers = new Headers({
    "X-Cloudflare-Email-Worker": "hosenur-email",
  });

  await message.forward(forwardTo, headers);
}

async function handleInboundEmail(
  message: ForwardableEmailMessage,
  env: Env,
): Promise<void> {
  if (
    !env.CLOUDFLARE_EMAIL_WEBHOOK_URL ||
    !env.CLOUDFLARE_EMAIL_WEBHOOK_SECRET
  ) {
    message.setReject("Cloudflare email webhook is not configured");
    return;
  }

  try {
    const response = await postInboundWebhook(message, env);

    if (!response.ok) {
      const body = await response.text();
      console.error("Inbound webhook failed", response.status, body);
      message.setReject("Inbound email webhook failed");
      return;
    }

    await forwardOriginalEmail(message, env.CLOUDFLARE_EMAIL_FORWARD_TO);
  } catch (error) {
    console.error("Inbound email worker error", error);
    message.setReject("Inbound email worker failed");
  }
}

async function handleOutboundEmail(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (!env.CLOUDFLARE_EMAIL_OUTBOUND_SECRET) {
    return Response.json(
      { error: "CLOUDFLARE_EMAIL_OUTBOUND_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (getBearerToken(request) !== env.CLOUDFLARE_EMAIL_OUTBOUND_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = parseOutboundRequest(await request.json().catch(() => null));

  if (!payload) {
    return Response.json(
      { error: "Invalid outbound payload" },
      { status: 400 },
    );
  }

  const result = await env.EMAIL.send({
    from: parseMailboxInput(payload.from),
    to: payload.to,
    cc: payload.cc && payload.cc.length > 0 ? payload.cc : undefined,
    bcc: payload.bcc && payload.bcc.length > 0 ? payload.bcc : undefined,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    replyTo: payload.replyTo ? parseMailboxInput(payload.replyTo) : undefined,
    attachments: payload.attachments?.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      type: attachment.contentType,
      disposition: "attachment" as const,
    })),
  });

  return Response.json({ success: true, messageId: result.messageId });
}

export default {
  email: handleInboundEmail,
  fetch: handleOutboundEmail,
} satisfies ExportedHandler<Env>;
