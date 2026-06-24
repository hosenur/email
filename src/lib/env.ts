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

export function getRootProtocol(
  rootDomain = getRootDomain(),
): "http" | "https" {
  return rootDomain.includes("localhost") || rootDomain.startsWith("127.0.0.1")
    ? "http"
    : "https";
}
