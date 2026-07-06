const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export { API_BASE };

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    let message: string;
    try {
      const json = JSON.parse(body);
      message = json.detail ?? json.message ?? body;
    } catch {
      message = body || `HTTP ${response.status}`;
    }
    throw new ApiError(response.status, message);
  }
  return response.json() as Promise<T>;
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
