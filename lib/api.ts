const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
import { cleanCredentialsAndRedirect, isTokenRefreshError } from "./auth-utils";

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
    // Try old key first, then new auth_tenant key
    currentTenantId = localStorage.getItem("tenant_id");
    if (!currentTenantId) {
      const storedTenant = localStorage.getItem("auth_tenant");
      if (storedTenant) {
        try {
          const tenant = JSON.parse(storedTenant);
          currentTenantId = tenant.id;
        } catch {
          // ignore parse errors
        }
      }
    }
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

  const makeRequest = async (token: string | null): Promise<Response> => {
    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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

    return fetch(`${API_URL}${endpoint}`, config);
  };

  let response = await makeRequest(accessToken);

  // If we get a 401, try to refresh the token
  if (response.status === 401 && accessToken) {
    const refreshToken =
      typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = await refreshResponse.json();

          // Update tokens and user data in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", newAccessToken);
            localStorage.setItem("refresh_token", newRefreshToken);
            if (user) {
              localStorage.setItem("auth_user", JSON.stringify(user));
              // Notify auth context to pick up the fresh user data
              window.dispatchEvent(new CustomEvent("auth_user_updated", { detail: user }));
            }
          }

          // Retry the original request with the new token
          response = await makeRequest(newAccessToken);
        } else {
          // Refresh failed, clean up and redirect
          throw new Error("TOKEN_REFRESH_FAILED");
        }
      } catch (error) {
        // Refresh failed, clean up and redirect
        throw new Error("TOKEN_REFRESH_FAILED");
      }
    } else {
      // No refresh token, clean up and redirect
      throw new Error("TOKEN_REFRESH_FAILED");
    }
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    const errorMessage = error.message || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

// Wrapper functions that handle token refresh failures
const withErrorHandling = async <T>(apiCall: Promise<T>): Promise<T> => {
  try {
    return await apiCall;
  } catch (error: any) {
    if (isTokenRefreshError(error)) {
      cleanCredentialsAndRedirect();
      // This will redirect, so we don't need to return anything
      throw error;
    }
    throw error;
  }
};

export const apiClient = {
  get: <T>(endpoint: string, options?: ApiOptions) =>
    withErrorHandling(api<T>(endpoint, { ...options, method: "GET" })),
  post: <T>(endpoint: string, body: unknown, options?: ApiOptions) =>
    withErrorHandling(api<T>(endpoint, { ...options, method: "POST", body })),
  put: <T>(endpoint: string, body: unknown, options?: ApiOptions) =>
    withErrorHandling(api<T>(endpoint, { ...options, method: "PUT", body })),
  patch: <T>(endpoint: string, body: unknown, options?: ApiOptions) =>
    withErrorHandling(api<T>(endpoint, { ...options, method: "PATCH", body })),
  delete: <T>(endpoint: string, options?: ApiOptions) =>
    withErrorHandling(api<T>(endpoint, { ...options, method: "DELETE" })),
};

// Upload via Next.js proxy to avoid browser CORS on direct R2 PUT
export async function uploadFile(file: File, key: string): Promise<string> {
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const tenantId = getTenantId();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("key", key);

  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (tenantId) headers["x-tenant-id"] = tenantId;

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to upload file" }));
    throw new Error(error.message || "Failed to upload file");
  }

  const { publicUrl } = (await response.json()) as { publicUrl: string };
  return publicUrl;
}

export default apiClient;
