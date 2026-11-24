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

/** Public marketing site. Workshop apps live only on its subdomains. */
export const ROOT_DOMAIN = (
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "basraservices.com"
)
  .trim()
  .toLowerCase()
  .replace(/^https?:\/\//, "")
  .replace(/\/.*$/, "")
  .replace(/^www\./, "");

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
  const isWorkshopHost = rest === "localhost" || rest === ROOT_DOMAIN;
  if (!isWorkshopHost) return null;
  if (RESERVED.has(sub) || !/^[a-z0-9-]+$/.test(sub)) return null;
  return sub;
}

export function readWorkshopSubdomain(): string {
  if (typeof window === "undefined") return "";
  return subdomainFromHost(window.location.host) ?? "";
}

export function isRootSite(host?: string): boolean {
  const hostname = (
    host ?? (typeof window !== "undefined" ? window.location.hostname : "")
  )
    .split(":")[0]
    .trim()
    .toLowerCase();
  return hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`;
}

export function workshopUrl(subdomain: string): string {
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".localhost")) {
    const port = window.location.port ? `:${window.location.port}` : "";
    return `${subdomain}.localhost${port}`;
  }
  return `${subdomain}.${ROOT_DOMAIN}`;
}

/** Leave the marketing host and open this workshop on its own subdomain. */
export function openWorkshopPath(subdomain: string, path: string) {
  if (typeof window === "undefined" || !isRootSite() || !subdomain) return false;
  const target = path.startsWith("/") ? path : `/${path}`;
  window.location.assign(`https://${workshopUrl(subdomain)}${target}`);
  return true;
}
