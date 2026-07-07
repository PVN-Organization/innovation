"use client";

import { useCallback, useEffect, useState } from "react";

import { API_BASE, get, postJson } from "@/lib/api/client";
import { BYPASS_AUTH_TEMP, TEST_AUTH_USER } from "@/lib/auth-bypass";

type AuthUser = {
  email: string;
  name: string;
  is_admin: boolean;
};

function resolveUser(remoteUser: AuthUser | null): AuthUser | null {
  if (remoteUser) return remoteUser;
  if (BYPASS_AUTH_TEMP) return { ...TEST_AUTH_USER };
  return null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const data = await get<{ user: AuthUser | null }>("/api/v1/auth/me");
      setUser(resolveUser(data.user));
    } catch {
      setUser(resolveUser(null));
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
    if (BYPASS_AUTH_TEMP) {
      setUser({ ...TEST_AUTH_USER });
      return;
    }
    window.location.href = `${API_BASE}/api/v1/auth/login`;
  }, []);

  const logout = useCallback(async () => {
    if (BYPASS_AUTH_TEMP) {
      setUser({ ...TEST_AUTH_USER });
      return;
    }
    try {
      await postJson("/api/v1/auth/logout", {});
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  return { user, loading, login, logout, refetch: fetchMe, isTestSession: BYPASS_AUTH_TEMP };
}
