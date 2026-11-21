const RESERVED = new Set([
  "www",
  "app",
  "api",
  "admin",
  "mail",
  "static",
  "cdn",
  "localhost",
]);

/** `demo.localhost` and `demo.example.com`. Apex hosts and reserved labels return null. */
export function subdomainFromHost(host: string): string | null {
  const hostname = host.split(":")[0].trim().toLowerCase();
  if (
    !hostname ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
  ) {
    return null;
  }

  const labels = hostname.split(".").filter(Boolean);
  if (labels.length < 2) return null;

  const sub = labels[0];
  const rest = labels.slice(1).join(".");
  const isWorkshopHost = rest === "localhost" || labels.length >= 3;
  if (!isWorkshopHost) return null;
  if (RESERVED.has(sub) || !/^[a-z0-9-]+$/.test(sub)) return null;
  return sub;
}

export function readWorkshopSubdomain(): string {
  if (typeof window === "undefined") return "";
  return subdomainFromHost(window.location.host) ?? "";
}

export function workshopUrl(subdomain: string): string {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (root) return `${subdomain}.${root}`;
  return `${subdomain}.localhost:3000`;
}
