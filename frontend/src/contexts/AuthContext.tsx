"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearStoredToken,
  fetchMe,
  getStoredToken,
  loginAdmin,
  logoutAdmin,
  type AdminProfile,
} from "@/services/auth";

type AuthContextValue = {
  admin: AdminProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      setAdmin(me);
    } catch {
      clearStoredToken();
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginAdmin(email, password);
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } catch {
      clearStoredToken();
    }
    setAdmin(null);
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  }, []);

  const value = useMemo(
    () => ({
      admin,
      loading,
      isAuthenticated: Boolean(admin),
      login,
      logout,
      refresh,
    }),
    [admin, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
