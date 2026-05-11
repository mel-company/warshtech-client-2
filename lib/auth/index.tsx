"use client";

import * as React from "react";
import type { AuthUser, AuthState, Permission } from "@/types";
import apiClient from "@/lib/api";

type AuthContextType = AuthState & {
  sendOTP: (phone: string) => Promise<boolean>;
  verifyOTP: (phone: string, code: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (resource: string, level: "read" | "write") => boolean;
  pendingPhone: string | null;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [pendingPhone, setPendingPhone] = React.useState<string | null>(null);

  // Check for existing session on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        const user = JSON.parse(stored) as AuthUser;
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const sendOTP = React.useCallback(async (phone: string): Promise<boolean> => {
    try {
      await apiClient.post("/auth/otp/send", { phone });
      setPendingPhone(phone);
      return true;
    } catch (error) {
      console.error("OTP send failed:", error);
      return false;
    }
  }, []);

  const verifyOTP = React.useCallback(
    async (phone: string, code: string): Promise<boolean> => {
      try {
        const response = await apiClient.post<{
          user: AuthUser;
          accessToken: string;
          refreshToken: string;
        }>("/auth/otp/verify", { phone, code });
        localStorage.setItem("auth_user", JSON.stringify(response.user));
        localStorage.setItem("access_token", response.accessToken);
        localStorage.setItem("refresh_token", response.refreshToken);
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
    [],
  );

  const logout = React.useCallback(() => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setState({ user: null, isAuthenticated: false, isLoading: false });
    setPendingPhone(null);
  }, []);

  const hasPermission = React.useCallback(
    (resource: string, level: "read" | "write"): boolean => {
      if (!state.user) return false;
      const permission = state.user.permissions.find(
        (p) => p.resource === resource,
      );
      if (!permission) return false;
      if (level === "read")
        return permission.level === "read" || permission.level === "write";
      return permission.level === "write";
    },
    [state.user],
  );

  const value = React.useMemo<AuthContextType>(
    () => ({
      ...state,
      sendOTP,
      verifyOTP,
      logout,
      hasPermission,
      pendingPhone,
    }),
    [state, sendOTP, verifyOTP, logout, hasPermission, pendingPhone],
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
