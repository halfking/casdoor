/**
 * 开轩统一认证服务 SDK
 * 所有产品通用的认证逻辑封装
 */

/* eslint-disable */

const KX_AUTH_TOKEN_KEY = "kx-auth-token";
const KX_AUTH_EVENT_KEY = "kx-auth-event";
const KX_TOKEN_REFRESH_INTERVAL = 30 * 1000; // 30秒刷新一次
const KX_UI_THEME_KEY = "kx-ui-theme";
const KX_UI_THEME_SYNC_KEY = "kx-ui-theme-sync";
const KX_AUTH_COOKIE_KEY = "kx_auth_token";

const SUPPORTED_THEMES = new Set(["daylight", "night"]);
const LEGACY_THEME_MAP = {light: "daylight", dark: "night"};
const DEFAULT_THEME = "daylight";

function getRuntimeProtocol() {
  if (typeof window === "undefined") {return "http:";}
  return window.location.protocol === "file:" ? "http:" : window.location.protocol;
}

function getRuntimeHostname() {
  if (typeof window === "undefined") {return "localhost";}
  return window.location.hostname;
}

function getRuntimeOrigin() {
  if (typeof window === "undefined") {return "http://localhost:8080";}
  return `${getRuntimeProtocol()}//${window.location.host}`;
}

function buildLocalServiceUrl(port, path = "") {
  const suffix = path.startsWith("/") || path === "" ? path : `/${path}`;
  return `${getRuntimeProtocol()}//${getRuntimeHostname()}:${port}${suffix}`;
}

function getCookieDomain() {
  if (typeof window === "undefined") {return "";}
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {return "";}
  if (hostname.endsWith(".itestu.cn")) {return ".itestu.cn";}
  return "";
}

function buildCookieAttributes(maxAgeSeconds = null) {
  const attributes = ["Path=/", "SameSite=Lax"];
  const domain = getCookieDomain();
  if (domain) {attributes.push(`Domain=${domain}`);}
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    attributes.push("Secure");
  }
  if (typeof maxAgeSeconds === "number") {
    attributes.push(`Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`);
  }
  return attributes.join("; ");
}

function readCookieValue(name) {
  if (typeof document === "undefined") {return null;}
  const encodedName = `${encodeURIComponent(name)}=`;
  const segments = document.cookie ? document.cookie.split("; ") : [];
  for (const segment of segments) {
    if (!segment.startsWith(encodedName)) {continue;}
    return decodeURIComponent(segment.slice(encodedName.length));
  }
  return null;
}

function writeCookieValue(name, value, maxAgeSeconds = null) {
  if (typeof document === "undefined") {return;}
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${buildCookieAttributes(maxAgeSeconds)}`;
}

function clearCookieValue(name) {
  if (typeof document === "undefined") {return;}
  document.cookie = `${encodeURIComponent(name)}=; ${buildCookieAttributes(0)}`;
}

function normalizeStoredAuthRecord(candidate) {
  if (!candidate || typeof candidate !== "object") {return null;}
  const token = typeof candidate.token === "string" ? candidate.token.trim() : "";
  if (!token) {return null;}
  const expiresAtValue = candidate.expiresAt;
  const expiresAt = typeof expiresAtValue === "number" || typeof expiresAtValue === "string"
    ? expiresAtValue
    : Date.now() + 24 * 60 * 60 * 1000;
  return {token, expiresAt};
}

function buildLegacyAuthRecord(tokenCandidate, expiresAtCandidate = null) {
  const token = typeof tokenCandidate === "string" ? tokenCandidate.trim() : "";
  if (!token) {return null;}
  const expiresAt = typeof expiresAtCandidate === "number" || typeof expiresAtCandidate === "string"
    ? expiresAtCandidate
    : Date.now() + 24 * 60 * 60 * 1000;
  return {token, expiresAt};
}

function recoverStoredAuthRecord(rawStoredValue) {
  if (typeof rawStoredValue !== "string") {return null;}

  const trimmed = rawStoredValue.trim();
  if (!trimmed) {return null;}

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "string") {
      return buildLegacyAuthRecord(parsed);
    }
    return normalizeStoredAuthRecord(parsed);
  } catch {
    return buildLegacyAuthRecord(trimmed);
  }
}

function readCookieAuthRecord() {
  try {
    const raw = readCookieValue(KX_AUTH_COOKIE_KEY);
    if (!raw) {return null;}
    return normalizeStoredAuthRecord(JSON.parse(raw));
  } catch (error) {
    console.error("[kx-auth] Failed to parse cookie token", error);
    return null;
  }
}

function persistAuthRecord(record) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KX_AUTH_TOKEN_KEY, JSON.stringify(record));
  }

  const expiresAtMs = new Date(record.expiresAt).getTime();
  const maxAgeSeconds = Number.isFinite(expiresAtMs)
    ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
    : 24 * 60 * 60;
  writeCookieValue(KX_AUTH_COOKIE_KEY, JSON.stringify(record), maxAgeSeconds);
}

// 环境判断
function isLocalEnv() {
  if (typeof window === "undefined") {return false;}
  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.")
  );
}

// 获取基础URL
function getBaseUrl() {
  const baseUrls = {
    portal: isLocalEnv() ? getRuntimeOrigin() : "https://www.itestu.cn",
    memora: isLocalEnv() ? buildLocalServiceUrl(8001) : "https://m.itestu.cn",
    acc: isLocalEnv() ? buildLocalServiceUrl(4100) : "https://acc.itestu.cn",
    auth: isLocalEnv() ? buildLocalServiceUrl(8000) : "https://auth.itestu.cn",
    stock: isLocalEnv() ? buildLocalServiceUrl(8090) : "https://finance.itestu.cn",
    trendaradar: isLocalEnv() ? `${getRuntimeOrigin()}/trendaradar` : "https://trendaradar.itestu.cn",
    docs: isLocalEnv() ? buildLocalServiceUrl(8200) : "https://docs.itestu.cn",
  };
  return baseUrls;
}

function getRuntimeConfig() {
  if (typeof window === "undefined") {return {};}
  return window.__KX_CONFIG__ || {};
}

function resolveCasdoorClientId() {
  const runtimeClientId = getRuntimeConfig().casdoorClientId;
  if (runtimeClientId) {return runtimeClientId;}
  const envClientId = typeof process !== "undefined"
    ? process.env?.REACT_APP_CASDOOR_CLIENT_ID || process.env?.VITE_CASDOOR_CLIENT_ID || process.env?.CASDOOR_CLIENT_ID
    : "";
  if (envClientId) {
    return String(envClientId);
  }
  return "";
}

function normalizeTheme(theme) {
  if (typeof theme !== "string") {return null;}
  const normalized = theme.trim().toLowerCase();
  if (SUPPORTED_THEMES.has(normalized)) {return normalized;}
  // 向后兼容: light→daylight, dark→night
  return LEGACY_THEME_MAP[normalized] || null;
}

export function getPreferredTheme() {
  if (typeof window === "undefined") {return DEFAULT_THEME;}

  const storedTheme = normalizeTheme(localStorage.getItem(KX_UI_THEME_KEY));
  if (storedTheme) {return storedTheme;}

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "night" : "daylight";
}

export function applyTheme(theme = getPreferredTheme()) {
  if (typeof document === "undefined") {return DEFAULT_THEME;}

  const normalized = normalizeTheme(theme) || DEFAULT_THEME;
  document.documentElement.dataset.theme = normalized;
  document.documentElement.style.colorScheme = normalized === "night" ? "dark" : "light";
  return normalized;
}

export function setPreferredTheme(theme) {
  const normalized = normalizeTheme(theme) || DEFAULT_THEME;

  if (typeof window !== "undefined") {
    localStorage.setItem(KX_UI_THEME_KEY, normalized);
    localStorage.setItem(KX_UI_THEME_SYNC_KEY, JSON.stringify({theme: normalized, at: Date.now()}));
    window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
      detail: {type: "theme_changed", data: normalized},
    }));
  }

  applyTheme(normalized);
  return normalized;
}

export function togglePreferredTheme() {
  return setPreferredTheme(getPreferredTheme() === "night" ? "daylight" : "night");
}

export function setupThemeSync(onThemeChange) {
  const applyAndNotify = (theme) => {
    const normalized = applyTheme(theme);
    onThemeChange?.(normalized);
  };

  applyAndNotify(getPreferredTheme());

  const storageHandler = (event) => {
    if (event.key !== KX_UI_THEME_KEY && event.key !== KX_UI_THEME_SYNC_KEY) {
      return;
    }

    if (event.key === KX_UI_THEME_KEY) {
      applyAndNotify(event.newValue);
      return;
    }

    try {
      const payload = JSON.parse(event.newValue || "{}");
      applyAndNotify(payload.theme);
    } catch {
      applyAndNotify(getPreferredTheme());
    }
  };

  const authEventHandler = (event) => {
    if (event.detail?.type === "theme_changed") {
      applyAndNotify(event.detail.data);
    }
  };

  window.addEventListener("storage", storageHandler);
  window.addEventListener(KX_AUTH_EVENT_KEY, authEventHandler);

  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener(KX_AUTH_EVENT_KEY, authEventHandler);
  };
}

/**
 * Token 存储结构
 * @typedef {Object} AuthToken
 * @property {string} token - JWT token
 * @property {number} expiresAt - 过期时间戳（毫秒）
 */

/**
 * 读取认证 Token
 * @returns {AuthToken | null}
 */
export function getStoredAuthToken() {
  try {
    const stored = localStorage.getItem(KX_AUTH_TOKEN_KEY);
    if (stored) {
      const parsed = recoverStoredAuthRecord(stored);
      if (parsed) {
        localStorage.setItem(KX_AUTH_TOKEN_KEY, JSON.stringify(parsed));
        return parsed;
      }
    }

    const cookieRecord = readCookieAuthRecord();
    if (cookieRecord) {
      localStorage.setItem(KX_AUTH_TOKEN_KEY, JSON.stringify(cookieRecord));
      return cookieRecord;
    }

    return null;
  } catch (e) {
    console.error("[kx-auth] Failed to parse stored token", e);
    const cookieRecord = readCookieAuthRecord();
    if (cookieRecord) {
      localStorage.setItem(KX_AUTH_TOKEN_KEY, JSON.stringify(cookieRecord));
      return cookieRecord;
    }
    return null;
  }
}

/**
 * 保存认证 Token
 * @param {string} token - JWT token
 * @param {number} [expiresAt] - 过期时间戳（毫秒），默认 24小时后过期
 */
export function writeStoredAuthToken(token, expiresAt = Date.now() + 24 * 60 * 60 * 1000) {
  const data = {token, expiresAt};
  persistAuthRecord(data);

  // 触发全局认证事件
  window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
    detail: {type: "login", data},
  }));
}

/**
 * 清除认证 Token
 */
export function clearStoredAuthToken() {
  localStorage.removeItem(KX_AUTH_TOKEN_KEY);
  clearCookieValue(KX_AUTH_COOKIE_KEY);

  // 触发全局认证事件
  window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
    detail: {type: "logout"},
  }));
}

/**
 * 检查 Token 是否有效（未过期）
 * @returns {boolean}
 */
export function isTokenValid() {
  const auth = getStoredAuthToken();
  if (!auth) {return false;}
  if (auth.expiresAt && new Date(auth.expiresAt) <= new Date()) {
    return false;
  }
  return true;
}

/**
 * 检查是否已认证
 * @returns {boolean}
 */
export function isAuthenticated() {
  return isTokenValid();
}

/**
 * 跳转到 Casdoor 登录页面
 * @param {string} [returnTo] - 登录成功后跳转的路径，默认为当前页面
 */
export function redirectToCasdoorLogin(returnTo = window.location.href) {
  const baseUrls = getBaseUrl();
  const loginUrl = new URL("/login/oauth/authorize", baseUrls.auth);

  const clientId = resolveCasdoorClientId();
  if (!clientId) {
    throw new Error("REACT_APP_CASDOOR_CLIENT_ID / VITE_CASDOOR_CLIENT_ID 未配置，无法使用统一认证登录");
  }

  const redirectUri = new URL("/auth/callback", window.location.origin).toString();
  const state = btoa(JSON.stringify({returnTo}));

  loginUrl.searchParams.set("client_id", clientId);
  loginUrl.searchParams.set("response_type", "code");
  loginUrl.searchParams.set("redirect_uri", redirectUri);
  loginUrl.searchParams.set("scope", "read");
  loginUrl.searchParams.set("state", state);

  window.location.href = loginUrl.toString();
}

/**
 * 跳转到统一登出页面
 */
export function redirectToCasdoorLogout() {
  const baseUrls = getBaseUrl();
  const logoutUrl = new URL("/logout", baseUrls.auth);
  window.location.href = logoutUrl.toString();
}

/**
 * 处理 SSO 跳转参数
 * @returns {string | null} SSO Token，如果没有则返回 null
 */
export function getSSOToken() {
  const url = new URL(window.location.href);
  const searchToken = url.searchParams.get("sso");
  if (searchToken) {
    url.searchParams.delete("sso");
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    return searchToken;
  }

  if (window.location.hash.startsWith("#sso=")) {
    const token = window.location.hash.slice(5);
    // 清除 hash
    history.replaceState(null, "", window.location.pathname + window.location.search);
    return token || null;
  }
  return null;
}

/**
 * 处理 SSO 登录
 * @returns {boolean} 是否处理了 SSO 登录
 */
export function handleSSOLogin() {
  const ssoToken = getSSOToken();
  if (ssoToken) {
    // 假设 SSO token 有效期为 24小时
    writeStoredAuthToken(ssoToken, Date.now() + 24 * 60 * 60 * 1000);
    return true;
  }
  return false;
}

/**
 * 创建 API 请求选项
 * @param {RequestInit} [options] - 自定义 fetch 选项
 * @returns {RequestInit}
 */
export function buildRequestOptions(options = {}) {
  const auth = getStoredAuthToken();
  const headers = new Headers(options.headers || {});

  if (auth && auth.token) {
    headers.set("Authorization", `Bearer ${auth.token}`);
  }

  if (!headers.has("Content-Type") && options.body && typeof options.body === "object") {
    headers.set("Content-Type", "application/json");
  }

  return {
    credentials: "include",
    ...options,
    headers,
  };
}

/**
 * API 请求封装，自动处理认证和错误
 * @param {string} url - 请求 URL
 * @param {RequestInit} [options] - fetch 选项
 * @returns {Promise<any>}
 */
export async function apiFetch(url, options = {}) {
  const res = await fetch(url, buildRequestOptions(options));

  if (res.status === 401) {
    // Token 过期，清除并跳转登录
    clearStoredAuthToken();
    redirectToCasdoorLogin();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({message: res.statusText}));
    throw new Error(error.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

/**
 * 认证事件监听
 * @param {function} callback - 事件回调，参数为 { type, data }
 * @returns {function} 移除监听的函数
 */
export function onAuthEvent(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(KX_AUTH_EVENT_KEY, handler);
  return () => window.removeEventListener(KX_AUTH_EVENT_KEY, handler);
}

/**
 * 跨标签页登出同步
 * 当其他标签页登出时，当前标签页也自动登出
 * @param {function} onLogout - 登出回调
 * @returns {function} 移除监听的函数
 */
export function setupAutoLogoutSync(onLogout) {
  const storageHandler = (e) => {
    if (e.key === KX_AUTH_TOKEN_KEY && !e.newValue) {
      // Token 被其他标签页清除，触发登出
      onLogout?.();
    }
  };

  window.addEventListener("storage", storageHandler);
  return () => window.removeEventListener("storage", storageHandler);
}

/**
 * Token 自动刷新器
 * @param {function} refreshFn - 刷新函数，返回 Promise<{ token: string, expiresAt: number }>
 * @param {number} [intervalMs] - 刷新间隔，默认 30秒
 * @returns {function} 停止刷新的函数
 */
export function setupTokenAutoRefresh(refreshFn, intervalMs = KX_TOKEN_REFRESH_INTERVAL) {
  let timer = null;

  const refresh = async() => {
    if (!isTokenValid()) {return;}

    try {
      const {token, expiresAt} = await refreshFn();
      writeStoredAuthToken(token, expiresAt);
    } catch (e) {
      console.error("[kx-auth] Failed to refresh token", e);
    }
  };

  // 立即刷新一次
  refresh();

  // 设置定时刷新
  timer = setInterval(refresh, intervalMs);

  return () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

// 权限相关功能
const KX_USER_PERMISSIONS_KEY = "kx-user-permissions";

/**
 * 保存用户权限列表
 * @param {Array<string>} permissions - 权限列表
 */
export function setUserPermissions(permissions) {
  localStorage.setItem(KX_USER_PERMISSIONS_KEY, JSON.stringify(permissions));

  // 触发权限更新事件
  window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
    detail: {type: "permissions_updated", data: permissions},
  }));
}

/**
 * 获取用户权限列表
 * @returns {Array<string>} 权限列表
 */
export function getUserPermissions() {
  try {
    const stored = localStorage.getItem(KX_USER_PERMISSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("[kx-auth] Failed to parse user permissions", e);
    return [];
  }
}

/**
 * 检查用户是否有指定权限
 * @param {string} permission - 权限标识
 * @returns {boolean}
 */
export function hasPermission(permission) {
  const permissions = getUserPermissions();
  return permissions.includes(permission) || permissions.includes("*");
}

/**
 * 检查用户是否有访问指定产品的权限
 * @param {string} productKey - 产品标识（如 'memora', 'acc', 'stock' 等）
 * @returns {boolean}
 */
export function hasProductAccess(productKey) {
  return hasPermission(`product:${productKey}:access`);
}

/**
 * 清除用户权限
 */
export function clearUserPermissions() {
  localStorage.removeItem(KX_USER_PERMISSIONS_KEY);
}

// 自动登出时清除权限
onAuthEvent((event) => {
  if (event.type === "logout") {
    clearUserPermissions();
  }
});

// 最近使用产品相关功能
const KX_RECENT_PRODUCTS_KEY = "kx-recent-products";
const MAX_RECENT_PRODUCTS = 5;

/**
 * 记录产品访问
 * @param {string} productKey - 产品标识
 * @param {string} [productName] - 产品名称
 */
export function recordProductAccess(productKey, productName) {
  if (!productKey) {return;}

  try {
    const recentProducts = getRecentProducts();

    // 移除已存在的相同产品
    const filtered = recentProducts.filter(p => p.key !== productKey);

    // 添加到头部
    filtered.unshift({
      key: productKey,
      name: productName || productKey,
      timestamp: Date.now(),
    });

    // 限制数量
    const limited = filtered.slice(0, MAX_RECENT_PRODUCTS);

    localStorage.setItem(KX_RECENT_PRODUCTS_KEY, JSON.stringify(limited));

    // 触发事件
    window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
      detail: {type: "recent_products_updated", data: limited},
    }));
  } catch (e) {
    console.error("[kx-auth] Failed to record product access", e);
  }
}

/**
 * 获取最近使用的产品列表
 * @returns {Array<{key: string, name: string, timestamp: number}>}
 */
export function getRecentProducts() {
  try {
    const stored = localStorage.getItem(KX_RECENT_PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("[kx-auth] Failed to get recent products", e);
    return [];
  }
}

/**
 * 清除最近使用产品记录
 */
export function clearRecentProducts() {
  localStorage.removeItem(KX_RECENT_PRODUCTS_KEY);

  window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
    detail: {type: "recent_products_updated", data: []},
  }));
}

// 登出时清除最近使用记录
onAuthEvent((event) => {
  if (event.type === "logout") {
    clearRecentProducts();
  }
});

// 自定义导航配置相关功能
const KX_CUSTOM_NAV_KEY = "kx-custom-nav-config";

// 默认导航配置
const DEFAULT_NAV_CONFIG = {
  pinnedProducts: ["memora", "acc", "finance"], // 固定显示在导航栏的产品
  hiddenProducts: [], // 隐藏的产品
  quickLinks: [], // 自定义快捷链接
  showRecent: true, // 是否显示最近使用
  showAllProducts: true, // 是否显示全部产品入口
};

/**
 * 获取自定义导航配置
 * @returns {object} 导航配置
 */
export function getCustomNavConfig() {
  try {
    const stored = localStorage.getItem(KX_CUSTOM_NAV_KEY);
    const userConfig = stored ? JSON.parse(stored) : {};
    return {...DEFAULT_NAV_CONFIG, ...userConfig};
  } catch (e) {
    console.error("[kx-auth] Failed to get custom nav config", e);
    return {...DEFAULT_NAV_CONFIG};
  }
}

/**
 * 保存自定义导航配置
 * @param {object} config - 配置对象，会与现有配置合并
 */
export function saveCustomNavConfig(config) {
  try {
    const currentConfig = getCustomNavConfig();
    const newConfig = {...currentConfig, ...config};

    localStorage.setItem(KX_CUSTOM_NAV_KEY, JSON.stringify(newConfig));

    // 触发事件
    window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
      detail: {type: "custom_nav_updated", data: newConfig},
    }));

    return newConfig;
  } catch (e) {
    console.error("[kx-auth] Failed to save custom nav config", e);
    throw e;
  }
}

/**
 * 重置自定义导航配置为默认值
 */
export function resetCustomNavConfig() {
  localStorage.removeItem(KX_CUSTOM_NAV_KEY);

  window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
    detail: {type: "custom_nav_updated", data: {...DEFAULT_NAV_CONFIG}},
  }));

  return {...DEFAULT_NAV_CONFIG};
}

/**
 * 固定产品到导航栏
 * @param {string} productKey - 产品标识
 */
export function pinProduct(productKey) {
  const config = getCustomNavConfig();
  if (!config.pinnedProducts.includes(productKey)) {
    const newPinned = [...config.pinnedProducts, productKey].slice(0, 5); // 最多固定5个
    return saveCustomNavConfig({pinnedProducts: newPinned});
  }
  return config;
}

/**
 * 取消固定产品
 * @param {string} productKey - 产品标识
 */
export function unpinProduct(productKey) {
  const config = getCustomNavConfig();
  const newPinned = config.pinnedProducts.filter(key => key !== productKey);
  return saveCustomNavConfig({pinnedProducts: newPinned});
}

/**
 * 隐藏产品
 * @param {string} productKey - 产品标识
 */
export function hideProduct(productKey) {
  const config = getCustomNavConfig();
  if (!config.hiddenProducts.includes(productKey)) {
    const newHidden = [...config.hiddenProducts, productKey];
    return saveCustomNavConfig({hiddenProducts: newHidden});
  }
  return config;
}

/**
 * 显示产品
 * @param {string} productKey - 产品标识
 */
export function showProduct(productKey) {
  const config = getCustomNavConfig();
  const newHidden = config.hiddenProducts.filter(key => key !== productKey);
  return saveCustomNavConfig({hiddenProducts: newHidden});
}

// 登出时清除自定义配置
onAuthEvent((event) => {
  if (event.type === "logout") {
    resetCustomNavConfig();
  }
});

export default {
  getStoredAuthToken,
  writeStoredAuthToken,
  clearStoredAuthToken,
  isTokenValid,
  isAuthenticated,
  redirectToCasdoorLogin,
  redirectToCasdoorLogout,
  getSSOToken,
  handleSSOLogin,
  buildRequestOptions,
  apiFetch,
  onAuthEvent,
  setupAutoLogoutSync,
  setupTokenAutoRefresh,
  isLocalEnv,
  getBaseUrl,
  setUserPermissions,
  getUserPermissions,
  hasPermission,
  hasProductAccess,
  clearUserPermissions,
  recordProductAccess,
  getRecentProducts,
  clearRecentProducts,
  getCustomNavConfig,
  saveCustomNavConfig,
  resetCustomNavConfig,
  pinProduct,
  unpinProduct,
  hideProduct,
  showProduct,
  getPreferredTheme,
  applyTheme,
  setPreferredTheme,
  togglePreferredTheme,
  setupThemeSync,
  KX_AUTH_TOKEN_KEY,
  KX_AUTH_EVENT_KEY,
  KX_TOKEN_REFRESH_INTERVAL,
  KX_USER_PERMISSIONS_KEY,
  KX_RECENT_PRODUCTS_KEY,
  KX_CUSTOM_NAV_KEY,
  KX_UI_THEME_KEY,
};
