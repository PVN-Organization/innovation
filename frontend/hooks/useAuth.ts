"use client";

import { useCallback, useEffect, useState } from "react";

import { API_BASE, get, postJson } from "@/lib/api/client";

type AuthUser = {
  email: string;
  name: string;
  is_admin: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const data = await get<{ user: AuthUser | null }>("/api/v1/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchMe();
    });
  }, [fetchMe]);

  const login = useCallback(() => {
    window.location.href = `${API_BASE}/api/v1/auth/login`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await postJson("/api/v1/auth/logout", {});
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  return { user, loading, login, logout, refetch: fetchMe };
}
