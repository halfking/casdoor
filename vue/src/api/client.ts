import { getAcceptLanguage } from "@/utils/management";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function resolveHeaders(body: BodyInit | null | undefined, headers?: HeadersInit): HeadersInit {
  const resolved: Record<string, string> = {
    "Accept-Language": getAcceptLanguage(),
  };

  if (body && !(body instanceof FormData)) {
    resolved["Content-Type"] = "application/json";
  }

  if (!headers) {
    return resolved;
  }

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      resolved[key] = value;
    });
    return resolved;
  }

  return {
    ...resolved,
    ...(Array.isArray(headers) ? Object.fromEntries(headers) : headers),
  };
}

export function buildQuery(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

export async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    ...init,
    headers: resolveHeaders(init.body, init.headers),
  });

  return response.json() as Promise<T>;
}

export async function requestText(url: string, init: RequestInit = {}): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    ...init,
    headers: resolveHeaders(init.body, init.headers),
  });

  return response.text();
}
