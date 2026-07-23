import { api } from "@/services/api";
import { AUTH_TOKEN_KEY } from "@/lib/api-config";

export type AdminProfile = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_at: string;
  admin: AdminProfile;
};

export async function loginAdmin(email: string, password: string) {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
  return data;
}

export async function logoutAdmin() {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export async function fetchMe() {
  const { data } = await api.get<AdminProfile>("/auth/me");
  return data;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
