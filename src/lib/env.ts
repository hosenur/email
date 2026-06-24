export function getRootDomain(): string {
  if (typeof __ROOT_DOMAIN__ !== "undefined") {
    return __ROOT_DOMAIN__;
  }

  if (typeof process !== "undefined") {
    return (
      process.env.VITE_ROOT_DOMAIN ||
      process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
      process.env.ROOT_DOMAIN ||
      "localhost:3000"
    );
  }

  return "localhost:3000";
}

export function getRootHostname(rootDomain = getRootDomain()): string {
  return rootDomain.split(":")[0].toLowerCase();
}

export function getMailDomain(rootDomain = getRootDomain()): string {
  if (typeof __MAIL_DOMAIN__ !== "undefined") {
    return __MAIL_DOMAIN__;
  }

  if (typeof process !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_MAIL_DOMAIN ||
      process.env.VITE_MAIL_DOMAIN ||
      process.env.MAIL_DOMAIN ||
      getRootHostname(rootDomain)
    );
  }

  return getRootHostname(rootDomain);
}

export function getRootProtocol(
  rootDomain = getRootDomain(),
): "http" | "https" {
  return rootDomain.includes("localhost") || rootDomain.startsWith("127.0.0.1")
    ? "http"
    : "https";
}
