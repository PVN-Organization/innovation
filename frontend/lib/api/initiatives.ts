import type { Initiative } from "@/lib/types";

import { get, postForm, postJson } from "./client";

export type InitiativeFilters = {
  page?: number;
  pageSize?: number;
  linhVuc?: string;
  donVi?: string;
  trangThai?: string;
  searchQuery?: string;
};

type InitiativeListResponse = {
  items: Initiative[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function fetchInitiatives(
  filters: InitiativeFilters = {},
): Promise<InitiativeListResponse> {
  const params: Record<string, string | undefined> = {
    page: filters.page?.toString(),
    pageSize: filters.pageSize?.toString(),
    linhVuc: filters.linhVuc,
    donVi: filters.donVi,
    trangThai: filters.trangThai,
    searchQuery: filters.searchQuery,
  };
  return get<InitiativeListResponse>("/api/v1/initiatives", params);
}

export async function submitInitiative(formData: FormData): Promise<Initiative> {
  return postForm<Initiative>("/api/v1/initiatives", formData);
}

export async function likeInitiative(id: number): Promise<Initiative> {
  return postJson<Initiative>(`/api/v1/initiatives/${id}/interest`, {});
}

export async function exportDocx(id: number): Promise<string> {
  const result = await postJson<{ downloadUrl: string }>(
    `/api/v1/initiatives/${id}/export-docx`,
    {},
  );
  return result.downloadUrl;
}
