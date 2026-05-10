const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "localhost:3000";

const MAIL_DOMAIN =
  process.env.NEXT_PUBLIC_MAIL_DOMAIN?.trim() || ROOT_DOMAIN.split(":")[0];

const ROOT_DOMAIN_HOST = ROOT_DOMAIN.split(":")[0];
const ROOT_DOMAIN_PORT = ROOT_DOMAIN.includes(":")
  ? ROOT_DOMAIN.split(":")[1]
  : "";

export function getRootDomain(): string {
  return ROOT_DOMAIN;
}

export function getMailDomain(): string {
  return MAIL_DOMAIN;
}

export function getRootDomainHost(): string {
  return ROOT_DOMAIN_HOST;
}

export function getAppProtocol(): "http" | "https" {
  return ROOT_DOMAIN.includes("localhost") || ROOT_DOMAIN.includes("127.0.0.1")
    ? "http"
    : "https";
}

export function getSubdomainFromHost(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  const mailDomain = MAIL_DOMAIN.toLowerCase();
  const rootHost = ROOT_DOMAIN_HOST.toLowerCase();

  if (
    hostname === rootHost ||
    hostname === `www.${rootHost}` ||
    hostname === mailDomain ||
    hostname === `www.${mailDomain}`
  ) {
    return null;
  }

  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    return hostname.split("---")[0] || null;
  }

  if (hostname.endsWith(".localhost")) {
    return hostname.split(".")[0] || null;
  }

  if (hostname.endsWith(`.${mailDomain}`)) {
    return hostname.replace(`.${mailDomain}`, "") || null;
  }

  return null;
}

export function getCurrentSubdomain(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return getSubdomainFromHost(window.location.host);
}

export function getMailboxEmail(subdomain: string): string {
  return `${subdomain.toLowerCase()}@${MAIL_DOMAIN}`;
}

export function getSubdomainFromEmail(email: string): string {
  return email.trim().toLowerCase().split("@")[0] || "";
}

export function isMailboxEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${MAIL_DOMAIN.toLowerCase()}`);
}

export function getMailboxOrigin(subdomain: string): string {
  const protocol = getAppProtocol();

  if (MAIL_DOMAIN === "localhost") {
    return `${protocol}://${subdomain}.localhost${ROOT_DOMAIN_PORT ? `:${ROOT_DOMAIN_PORT}` : ""}`;
  }

  return `${protocol}://${subdomain}.${MAIL_DOMAIN}`;
}

export function getMailboxUrl(email: string): string {
  return getMailboxOrigin(getSubdomainFromEmail(email));
}

export function getSharedCookieDomain(): string | null {
  if (MAIL_DOMAIN === "localhost" || MAIL_DOMAIN.endsWith(".localhost")) {
    return null;
  }

  return `.${MAIL_DOMAIN}`;
}
