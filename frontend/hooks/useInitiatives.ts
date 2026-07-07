"use client";

import { useCallback, useEffect, useState } from "react";

import {
  approveInitiative as apiApprove,
  fetchInitiatives as apiFetch,
  likeInitiative as apiLike,
  type InitiativeFilters,
} from "@/lib/api/initiatives";
import type { Initiative } from "@/lib/types";

function formatNgayNop(value: string): string {
  if (!value) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function normalizeInitiative(item: Initiative): Initiative {
  return {
    ...item,
    ngayNop: formatNgayNop(item.ngayNop),
  };
}

export function useInitiatives(filters: InitiativeFilters = { pageSize: 100 }) {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch({ pageSize: 100, ...filters });
      setInitiatives(res.items.map(normalizeInitiative));
    } catch (err) {
      setInitiatives([]);
      setError(err instanceof Error ? err.message : "Không thể kết nối API");
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.donVi,
    filters.linhVuc,
    filters.trangThai,
    filters.searchQuery,
    filters.page,
    filters.pageSize,
  ]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  const optimisticLike = useCallback((id: number) => {
    setInitiatives((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quanTam: item.quanTam + 1 } : item,
      ),
    );
    apiLike(id).catch(() => {
      setInitiatives((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quanTam: item.quanTam - 1 } : item,
        ),
      );
    });
  }, []);

  const updateLocal = useCallback((id: number, data: Partial<Initiative>) => {
    setInitiatives((items) =>
      items.map((item) => (item.id === id ? { ...item, ...data } : item)),
    );
  }, []);

  const approveInitiative = useCallback(async (id: number) => {
    const updated = normalizeInitiative(await apiApprove(id));
    setInitiatives((items) =>
      items.map((item) => (item.id === id ? updated : item)),
    );
    return updated;
  }, []);

  return {
    initiatives,
    isLoading,
    error,
    optimisticLike,
    refresh,
    updateLocal,
    approveInitiative,
  };
}
