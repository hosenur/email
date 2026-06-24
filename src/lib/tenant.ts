import {
  getMailDomain,
  getRootDomain,
  getRootHostname,
  getRootProtocol,
} from "@/lib/env";

function normalizeRootDomain(rootDomain = getRootDomain()): string {
  return getRootHostname(rootDomain);
}

function normalizeHost(host: string): string {
  return host.split(":")[0].toLowerCase();
}

export function getSubdomainFromHost(
  host: string | null | undefined,
  rootDomain = getRootDomain(),
): string | null {
  if (!host) return null;

  const hostname = normalizeHost(host);

  if (hostname.includes(".localhost")) {
    return hostname.split(".")[0] || null;
  }

  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    return hostname.split("---")[0] || null;
  }

  const rootDomainFormatted = normalizeRootDomain(rootDomain);
  const mailDomainFormatted = getRootHostname(getMailDomain(rootDomain));
  const rootHosts = new Set([
    mailDomainFormatted,
    `www.${mailDomainFormatted}`,
    rootDomainFormatted,
    `www.${rootDomainFormatted}`,
  ]);

  if (rootHosts.has(hostname)) {
    return null;
  }

  for (const domain of [mailDomainFormatted, rootDomainFormatted]) {
    if (hostname.endsWith(`.${domain}`)) {
      return hostname.replace(`.${domain}`, "") || null;
    }
  }

  return null;
}

export function getEmailLocalPart(email: string): string {
  return email.split("@")[0]?.toLowerCase() ?? "";
}

function getEmailDomain(email: string): string {
  return email.split("@").slice(1).join("@").toLowerCase();
}

export function isEmailAllowedForSubdomain(
  email: string,
  subdomain: string | null,
): boolean {
  if (!subdomain) return true;

  return (
    getEmailLocalPart(email) === subdomain.toLowerCase() &&
    getEmailDomain(email) === getMailDomain().toLowerCase()
  );
}

export function getTenantEmail(subdomain: string): string {
  return `${subdomain.toLowerCase()}@${getMailDomain().toLowerCase()}`;
}

export function getTenantUrl(email: string): string {
  const subdomain = getEmailLocalPart(email);
  const rootDomain = getRootDomain();
  const mailDomain = getMailDomain(rootDomain);
  const rootPort = rootDomain.includes(":") ? rootDomain.split(":")[1] : "";

  if (mailDomain === "localhost") {
    return `${getRootProtocol(rootDomain)}://${subdomain}.localhost${
      rootPort ? `:${rootPort}` : ""
    }`;
  }

  return `${getRootProtocol(rootDomain)}://${subdomain}.${mailDomain}`;
}
