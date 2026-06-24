import { getRootDomain, getRootHostname, getRootProtocol } from "@/lib/env";

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
  const rootHosts = new Set([
    rootDomainFormatted,
    `www.${rootDomainFormatted}`,
  ]);

  if (rootHosts.has(hostname)) {
    return null;
  }

  if (hostname.endsWith(`.${rootDomainFormatted}`)) {
    return hostname.replace(`.${rootDomainFormatted}`, "") || null;
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
    getEmailDomain(email) === normalizeRootDomain()
  );
}

export function getTenantEmail(subdomain: string): string {
  return `${subdomain.toLowerCase()}@${normalizeRootDomain()}`;
}

export function getTenantUrl(email: string): string {
  const subdomain = getEmailLocalPart(email);
  const rootDomain = getRootDomain();
  return `${getRootProtocol(rootDomain)}://${subdomain}.${rootDomain}`;
}
