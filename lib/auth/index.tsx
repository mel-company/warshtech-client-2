"use client";

import * as React from "react";
import type { AuthUser, AuthState } from "@/types";
import { apiClient, setTenantId, clearTenantId } from "@/lib/api";
import { cleanCredentialsAndRedirect } from "@/lib/auth-utils";

export interface TenantInfo {
  id: string;
  name: string;
  subdomain: string;
  logo?: string | null;
  countryCode?: string;
}

type AuthContextType = AuthState & {
  sendOTP: (phone: string) => Promise<boolean>;
  verifyOTP: (phone: string, code: string) => Promise<boolean>;
  login: (
    phone: string,
    password: string,
    tenantId: string,
  ) => Promise<boolean>;
  register: (
    data: RegisterData,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (resource: string, level: "read" | "write") => boolean;
  pendingPhone: string | null;
  tenant: TenantInfo | null;
  setTenant: (tenant: TenantInfo) => void;
};

export interface RegisterData {
  tenantName: string;
  subdomain: string;
  userName: string;
  phone: string;
  password: string;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [pendingPhone, setPendingPhone] = React.useState<string | null>(null);
  const [tenant, setTenantState] = React.useState<TenantInfo | null>(null);

  // Check for existing session on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const storedTenant = localStorage.getItem("auth_tenant");
    const accessToken = localStorage.getItem("access_token");
    const storedTenantId = localStorage.getItem("tenant_id");

    if (storedUser && accessToken) {
      try {
        const user = JSON.parse(storedUser) as AuthUser;
        const tenant = storedTenant
          ? (JSON.parse(storedTenant) as TenantInfo)
          : null;
        if (tenant) {
          setTenantState(tenant);
          setTenantId(tenant.id);
        } else if (storedTenantId) {
          setTenantId(storedTenantId);
        }
        setState({ user, isAuthenticated: true, isLoading: false });

        // Fetch fresh user data from server to pick up permission changes
        apiClient
          .get<AuthUser>("/auth/me")
          .then((freshUser) => {
            localStorage.setItem("auth_user", JSON.stringify(freshUser));
            setState((prev) => ({
              ...prev,
              user: freshUser,
            }));
          })
          .catch(() => {
            // Silently ignore — cached data is still usable
          });
      } catch {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  // Listen for user data updates from token refresh
  React.useEffect(() => {
    const handleUserUpdated = (e: Event) => {
      const user = (e as CustomEvent).detail as AuthUser;
      if (user) {
        setState((prev) => ({
          ...prev,
          user,
          isAuthenticated: true,
        }));
      }
    };
    window.addEventListener("auth_user_updated", handleUserUpdated);
    return () => window.removeEventListener("auth_user_updated", handleUserUpdated);
  }, []);

  const sendOTP = React.useCallback(
    async (phone: string): Promise<boolean> => {
      try {
        await apiClient.post(
          "/auth/otp/send",
          { phone },
          { tenantId: tenant?.id },
        );
        setPendingPhone(phone);
        return true;
      } catch (error) {
        console.error("OTP send failed:", error);
        return false;
      }
    },
    [tenant],
  );

  const login = React.useCallback(
    async (
      phone: string,
      password: string,
      tenantId: string,
    ): Promise<boolean> => {
      try {
        const response = await apiClient.post<{
          accessToken: string;
          refreshToken: string;
          tenant: TenantInfo;
          user: AuthUser;
        }>("/auth/login", { phone, password, tenantId });
        localStorage.setItem("auth_user", JSON.stringify(response.user));
        localStorage.setItem("access_token", response.accessToken);
        localStorage.setItem("refresh_token", response.refreshToken);
        localStorage.setItem("auth_tenant", JSON.stringify(response.tenant));
        localStorage.setItem("tenant_id", response.tenant.id);
        setTenantState(response.tenant);
        setTenantId(response.tenant.id);
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } catch (error) {
        console.error("Login failed:", error);
        return false;
      }
    },
    [],
  );

  const register = React.useCallback(
    async (
      data: RegisterData,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        await apiClient.post("/auth/register", data);
        return { success: true };
      } catch (error: any) {
        const message = error?.response?.data?.message || "Registration failed";
        return {
          success: false,
          error: Array.isArray(message) ? message[0] : message,
        };
      }
    },
    [],
  );

  const verifyOTP = React.useCallback(
    async (phone: string, code: string): Promise<boolean> => {
      try {
        const response = await apiClient.post<{
          accessToken: string;
          refreshToken: string;
          tenant: TenantInfo;
          user: AuthUser;
        }>("/auth/otp/verify", { phone, code }, { tenantId: tenant?.id });
        localStorage.setItem("auth_user", JSON.stringify(response.user));
        localStorage.setItem("access_token", response.accessToken);
        localStorage.setItem("refresh_token", response.refreshToken);
        localStorage.setItem("auth_tenant", JSON.stringify(response.tenant));
        localStorage.setItem("tenant_id", response.tenant.id);
        setTenantState(response.tenant);
        setTenantId(response.tenant.id);
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
        setPendingPhone(null);
        return true;
      } catch (error) {
        console.error("OTP verify failed:", error);
        return false;
      }
    },
    [tenant],
  );

  const logout = React.useCallback(() => {
    cleanCredentialsAndRedirect();
    setState({ user: null, isAuthenticated: false, isLoading: false });
    setPendingPhone(null);
    setTenantState(null);
  }, []);

  const setTenant = React.useCallback((newTenant: TenantInfo) => {
    setTenantState(newTenant);
    localStorage.setItem("auth_tenant", JSON.stringify(newTenant));
  }, []);

  const hasPermission = React.useCallback(
    (resource: string, level: "read" | "write"): boolean => {
      if (!state.user) return false;

      // Owner users have unlimited access (unchangeable role for workshop creator)
      if (state.user.role === 'Owner') {
        return true;
      }

      const resourceUpper = resource.toUpperCase();
      const readPerm = `${resourceUpper}_READ`;
      const writePerm = `${resourceUpper}_WRITE`;

      if (level === "read") {
        return (
          state.user.permissions.includes(readPerm) ||
          state.user.permissions.includes(writePerm)
        );
      }
      return state.user.permissions.includes(writePerm);
    },
    [state.user],
  );

  const value = React.useMemo<AuthContextType>(
    () => ({
      ...state,
      sendOTP,
      verifyOTP,
      login,
      register,
      logout,
      hasPermission,
      pendingPhone,
      tenant,
      setTenant,
    }),
    [
      state,
      sendOTP,
      verifyOTP,
      login,
      register,
      logout,
      hasPermission,
      pendingPhone,
      tenant,
      setTenant,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
