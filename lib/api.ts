const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  credentials?: boolean;
  tenantId?: string;
}

// Tenant context - stored in memory (or localStorage for persistence)
let currentTenantId: string | null = null;

export function setTenantId(tenantId: string) {
  currentTenantId = tenantId;
  if (typeof window !== "undefined") {
    localStorage.setItem("tenant_id", tenantId);
  }
}

export function getTenantId(): string | null {
  if (currentTenantId) return currentTenantId;
  if (typeof window !== "undefined") {
    currentTenantId = localStorage.getItem("tenant_id");
  }
  return currentTenantId;
}

export function clearTenantId() {
  currentTenantId = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("tenant_id");
  }
}

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    credentials = true,
    tenantId,
  } = options;

  // Get token from localStorage
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...headers,
    },
    credentials: credentials ? "include" : undefined,
  };

  // Add tenant header if provided or if we have a current tenant
  const effectiveTenantId = tenantId || getTenantId();
  if (effectiveTenantId) {
    config.headers = {
      ...config.headers,
      "x-tenant-id": effectiveTenantId,
    };
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body: unknown, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: "POST", body }),
  put: <T>(endpoint: string, body: unknown, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: "PUT", body }),
  delete: <T>(endpoint: string, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: "DELETE" }),
};

export default apiClient;
