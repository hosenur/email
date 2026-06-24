import {
  getMailDomain,
  getRootDomain,
  getRootHostname,
  getRootProtocol,
} from "@/lib/env";
import { getEmailLocalPart, getSubdomainFromHost } from "@/lib/tenant";

export { getMailDomain, getRootDomain, getSubdomainFromHost };

export function getRootDomainHost(): string {
  return getRootHostname();
}

export function getAppProtocol(): "http" | "https" {
  return getRootProtocol();
}

export function getMailboxEmail(subdomain: string): string {
  return `${subdomain.toLowerCase()}@${getMailDomain().toLowerCase()}`;
}

export function getSubdomainFromEmail(email: string): string {
  return getEmailLocalPart(email);
}

export function isMailboxEmail(email: string): boolean {
  return email
    .trim()
    .toLowerCase()
    .endsWith(`@${getMailDomain().toLowerCase()}`);
}

export function getMailboxOrigin(subdomain: string): string {
  const rootDomain = getRootDomain();
  const mailDomain = getMailDomain();
  const protocol = getRootProtocol(rootDomain);
  const rootPort = rootDomain.includes(":") ? rootDomain.split(":")[1] : "";

  if (mailDomain === "localhost") {
    return `${protocol}://${subdomain}.localhost${rootPort ? `:${rootPort}` : ""}`;
  }

  return `${protocol}://${subdomain}.${mailDomain}`;
}

export function getMailboxUrl(email: string): string {
  return getMailboxOrigin(getSubdomainFromEmail(email));
}

export function getSharedCookieDomain(): string | null {
  const mailDomain = getMailDomain();

  if (mailDomain === "localhost" || mailDomain.endsWith(".localhost")) {
    return null;
  }

  return `.${mailDomain}`;
}
