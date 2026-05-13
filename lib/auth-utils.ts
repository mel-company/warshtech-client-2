/**
 * Authentication utilities for handling credential cleanup and redirects
 */

export function cleanCredentialsAndRedirect() {
  if (typeof window !== "undefined") {
    // Clear all authentication-related data
    localStorage.removeItem("auth_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_tenant");
    localStorage.removeItem("tenant_id");
    
    // Redirect to auth page
    window.location.href = "/auth";
  }
}

export function isTokenRefreshError(error: any): boolean {
  return error?.message === "TOKEN_REFRESH_FAILED";
}
