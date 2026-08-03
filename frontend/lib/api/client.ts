function resolveApiBase(): string {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  const configured = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  if (typeof window === "undefined") {
    return configured || basePath;
  }

  if (!configured) return basePath;

  try {
    const configuredOrigin = new URL(configured).origin;
    // Same-origin reverse proxy: use basePath so API is /sang-kien/api/...
    if (configuredOrigin !== window.location.origin) return basePath;
  } catch {
    return configured.startsWith("/") ? configured : basePath;
  }

  return configured || basePath;
}

const API_BASE = resolveApiBase();
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

/** Prefix public assets for Next basePath deployments. */
export function assetPath(path: string): string {
  if (!path.startsWith("/")) return `${BASE_PATH}/${path}`;
  return `${BASE_PATH}${path}`;
}

export { API_BASE, BASE_PATH };

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const body = await response.text();

  if (!response.ok) {
    let message: string;
    try {
      const json = JSON.parse(body);
      message = json.detail ?? json.message ?? body;
    } catch {
      if (response.status === 404) {
        message =
          "Không tìm thấy API backend. Kiểm tra backend đang chạy và cấu hình NEXT_PUBLIC_API_URL hoặc proxy /api.";
      } else {
        message = body || `HTTP ${response.status}`;
      }
    }
    throw new ApiError(response.status, message);
  }

  if (!body) {
    throw new ApiError(response.status, "Phản hồi API rỗng");
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new ApiError(
      response.status,
      "Phản hồi API không hợp lệ (không phải JSON). Kiểm tra cấu hình proxy hoặc NEXT_PUBLIC_API_URL.",
    );
  }
}

export async function get<T>(
  path: string,
  params?: Record<string, string | undefined>,
): Promise<T> {
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") qs.set(key, value);
    }
    const s = qs.toString();
    if (s) url += `?${s}`;
  }
  const response = await fetch(url, { credentials: "include" });
  return handleResponse<T>(response);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return handleResponse<T>(response);
}

export async function postForm<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  return handleResponse<T>(response);
}

export async function putJson<T>(path: string, body: unknown = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return handleResponse<T>(response);
}
