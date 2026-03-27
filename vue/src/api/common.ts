export type QueryValue = string | number | boolean | null | undefined;

export function getAcceptLanguage(): string {
  if (typeof navigator !== "undefined") {
    return navigator.languages?.[0] ?? navigator.language ?? "en";
  }

  return "en";
}

export function buildUrl(path: string, params: Record<string, QueryValue> = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export function buildIdUrl(
  path: string,
  owner: string,
  name: string,
  params: Record<string, QueryValue> = {},
): string {
  const searchParams = new URLSearchParams();
  searchParams.set("id", `${owner}/${encodeURIComponent(name)}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    searchParams.set(key, String(value));
  });

  return `${path}?${searchParams.toString()}`;
}

export function cloneBody<T>(body: T): T {
  if (body === undefined || body === null) {
    return body;
  }

  if (typeof structuredClone === "function") {
    return structuredClone(body);
  }

  return JSON.parse(JSON.stringify(body)) as T;
}

export function toFormData(values: Record<string, unknown>): FormData {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof Blob) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}
