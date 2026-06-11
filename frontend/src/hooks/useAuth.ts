"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ApiRequestError } from "@/lib/api";
import { getCurrentUser, getToken, logout as clearAuth } from "@/lib/auth";
import type { User } from "@/types/auth";

export function useAuth(requireAuth = false) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      if (requireAuth) {
        router.replace("/login");
      }
      return;
    }

    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setError("");
      })
      .catch((err) => {
        clearAuth();
        setUser(null);
        if (err instanceof ApiRequestError) {
          setError(err.message);
        } else {
          setError("Session expired. Please sign in again.");
        }
        if (requireAuth) {
          router.replace("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [requireAuth, router]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setError("");
    router.push("/login");
  }, [router]);

  return { user, loading, error, logout };
}
