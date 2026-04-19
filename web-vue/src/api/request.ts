import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { useAppStore } from "../stores/app";
import { useAuthStore } from "../stores/auth";
import * as Conf from "../Conf";
import { message, Modal } from "ant-design-vue";
import i18n from "../i18n";
import { clearStoredAuthToken, getStoredAuthToken, isTokenValid } from "../shared/auth/auth-service.js";

// ---------- Standard API response shape from Go backend ----------
export interface ApiResponse<T = unknown> {
  status: "ok" | "error";
  msg: string;
  sub?: string;
  name?: string;
  data: T;
  data2?: unknown;
  data3?: unknown;
}

// Paginated responses use data2 for total count
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  data2: number;
}

// ---------- Accept-Language helper (matches React Setting.getAcceptLanguage) ----------
function getAcceptLanguage(): string {
  const lang = i18n.global.locale.value;
  if (!lang) return "en;q=0.9,en;q=0.8";
  return `${lang};q=0.9,en;q=0.8`;
}

// ---------- Demo-mode denied check ----------
function isResponseDenied(data: ApiResponse): boolean {
  return data.msg === "Unauthorized operation" || data.msg === "未授权的操作";
}

function shouldAttachAuthorizationHeader(url?: string): boolean {
  if (!url) return false;

  // Casdoor Web relies on the server-side session cookie for same-origin APIs.
  // Do not leak shared SSO bearer tokens from other itestu.cn apps into auth.itestu.cn.
  if (url.startsWith("/")) {
    return false;
  }

  try {
    const resolvedUrl = new URL(url, window.location.origin);
    return resolvedUrl.origin !== window.location.origin;
  } catch {
    return false;
  }
}

// ---------- Create axios instance ----------
const request: AxiosInstance = axios.create({
  baseURL: "",
  timeout: 60_000,
  withCredentials: true,
});

// ---------- Request interceptor ----------
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers.set("Accept-Language", getAcceptLanguage());
    if ((config.method || "").toLowerCase() === "get") {
      // Aggressively prevent intermediary proxies from serving stale cached auth state.
      config.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      config.headers.set("Pragma", "no-cache");
      config.headers.set("Expires", "0");
    }

    // Attach Bearer token only when the stored SSO token is still valid.
    if (shouldAttachAuthorizationHeader(config.url)) {
      try {
        if (isTokenValid()) {
          const authRecord = getStoredAuthToken();
          if (authRecord?.token) {
            config.headers.set("Authorization", `Bearer ${authRecord.token}`);
          }
        } else {
          clearStoredAuthToken();
        }
      } catch {
        clearStoredAuthToken();
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Response interceptor ----------
request.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse;

    // Demo-mode interception
    if (Conf.IsDemoMode && data && isResponseDenied(data)) {
      const t = i18n.global.t;
      Modal.confirm({
        title: t("general:This is a read-only demo site!"),
        content: t("general:Go to writable demo site?"),
        okText: t("general:OK"),
        cancelText: t("general:Cancel"),
        onOk() {
          window.open(
            `https://demo.casdoor.com${location.pathname}${location.search}?username=built-in/admin&password=123`,
            "_self"
          );
        },
      });
    }

    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        const auth = useAuthStore();
        auth.logout();
        clearStoredAuthToken();
        // Redirect to login if not already there
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.href)}`;
        }
      } else if (status === 403) {
        message.error("Forbidden");
      } else if (status >= 500) {
        message.error("Server error");
      }
    } else if (error.request) {
      message.error("Network error");
    }
    return Promise.reject(error);
  }
);

// ---------- Typed convenience helpers ----------

/** GET request returning full ApiResponse */
export function get<T = unknown>(
  url: string,
  params?: Record<string, string | number | boolean>,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return request.get(url, { params, ...config }).then((r) => r.data);
}

/** POST request (JSON body) returning full ApiResponse */
export function post<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return request.post(url, data, config).then((r) => r.data);
}

export function put<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return request.put(url, data, config).then((r) => r.data);
}

export function del<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return request.delete(url, config).then((r) => r.data);
}

/** Shallow copy — matches React Setting.deepCopy behaviour */
export function shallowCopy<T extends Record<string, unknown>>(obj: T): T {
  return Object.assign({}, obj);
}

export default request;
