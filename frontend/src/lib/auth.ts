import { apiFetch } from "@/lib/api";
import type { AuthTokens, LoginPayload, RegisterPayload, User } from "@/types/auth";

const TOKEN_KEY = "funded_shield_token";

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function registerUser(payload: RegisterPayload): Promise<User> {
  return apiFetch<User>("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokens> {
  const body = new URLSearchParams({
    username: payload.email,
    password: payload.password,
  });

  return apiFetch<AuthTokens>("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
}

export async function getCurrentUser(): Promise<User> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiFetch<User>("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function logout(): void {
  removeToken();
}
