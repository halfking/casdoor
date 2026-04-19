/**
 * 开轩统一认证服务 SDK
 * 由 shared/auth/auth-service.js 内置到 Casdoor Web Vue，避免部署依赖外部目录。
 */

const KX_AUTH_TOKEN_KEY = 'kx-auth-token';
const KX_AUTH_EVENT_KEY = 'kx-auth-event';
const KX_TOKEN_REFRESH_INTERVAL = 30 * 1000;
const KX_UI_THEME_KEY = 'kx-ui-theme';
const KX_UI_THEME_SYNC_KEY = 'kx-ui-theme-sync';
const KX_AUTH_COOKIE_KEY = 'kx_auth_token';

const SUPPORTED_THEMES = new Set(['daylight', 'night']);
const LEGACY_THEME_MAP = { light: 'daylight', dark: 'night' };
const DEFAULT_THEME = 'daylight';

function getRuntimeProtocol() {
  if (typeof window === 'undefined') return 'http:';
  return window.location.protocol === 'file:' ? 'http:' : window.location.protocol;
}

function getRuntimeHostname() {
  if (typeof window === 'undefined') return 'localhost';
  return window.location.hostname;
}

function getRuntimeOrigin() {
  if (typeof window === 'undefined') return 'http://localhost:8080';
  return `${getRuntimeProtocol()}//${window.location.host}`;
}

function buildLocalServiceUrl(port, path = '') {
  const suffix = path.startsWith('/') || path === '' ? path : `/${path}`;
  return `${getRuntimeProtocol()}//${getRuntimeHostname()}:${port}${suffix}`;
}

function getCookieDomain() {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return '';
  if (hostname.endsWith('.itestu.cn')) return '.itestu.cn';
  return '';
}

function buildCookieAttributes(maxAgeSeconds = null) {
  const attributes = ['Path=/', 'SameSite=Lax'];
  const domain = getCookieDomain();
  if (domain) attributes.push(`Domain=${domain}`);
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    attributes.push('Secure');
  }
  if (typeof maxAgeSeconds === 'number') {
    attributes.push(`Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`);
  }
  return attributes.join('; ');
}

function readCookieValue(name) {
  if (typeof document === 'undefined') return null;
  const encodedName = `${encodeURIComponent(name)}=`;
  const segments = document.cookie ? document.cookie.split('; ') : [];
  for (const segment of segments) {
    if (!segment.startsWith(encodedName)) continue;
    return decodeURIComponent(segment.slice(encodedName.length));
  }
  return null;
}

function writeCookieValue(name, value, maxAgeSeconds = null) {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${buildCookieAttributes(maxAgeSeconds)}`;
}

function clearCookieValue(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; ${buildCookieAttributes(0)}`;
}

function normalizeStoredAuthRecord(candidate) {
  if (!candidate || typeof candidate !== 'object') return null;
  const token = typeof candidate.token === 'string' ? candidate.token.trim() : '';
  if (!token) return null;
  const expiresAtValue = candidate.expiresAt;
  const expiresAt = typeof expiresAtValue === 'number' || typeof expiresAtValue === 'string'
    ? expiresAtValue
    : Date.now() + 24 * 60 * 60 * 1000;
  return { token, expiresAt };
}

function buildLegacyAuthRecord(tokenCandidate, expiresAtCandidate = null) {
  const token = typeof tokenCandidate === 'string' ? tokenCandidate.trim() : '';
  if (!token) return null;
  const expiresAt = typeof expiresAtCandidate === 'number' || typeof expiresAtCandidate === 'string'
    ? expiresAtCandidate
    : Date.now() + 24 * 60 * 60 * 1000;
  return { token, expiresAt };
}

function recoverStoredAuthRecord(rawStoredValue) {
  if (typeof rawStoredValue !== 'string') return null;

  const trimmed = rawStoredValue.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'string') {
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
    if (!raw) return null;
    return normalizeStoredAuthRecord(JSON.parse(raw));
  } catch (error) {
    console.error('[kx-auth] Failed to parse cookie token', error);
    return null;
  }
}

function persistAuthRecord(record) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KX_AUTH_TOKEN_KEY, JSON.stringify(record));
  }

  const expiresAtMs = new Date(record.expiresAt).getTime();
  const maxAgeSeconds = Number.isFinite(expiresAtMs)
    ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
    : 24 * 60 * 60;
  writeCookieValue(KX_AUTH_COOKIE_KEY, JSON.stringify(record), maxAgeSeconds);
}

function isLocalEnv() {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  );
}

function getBaseUrl() {
  const baseUrls = {
    portal: isLocalEnv() ? getRuntimeOrigin() : 'https://www.itestu.cn',
    memora: isLocalEnv() ? buildLocalServiceUrl(8001) : 'https://memora.itestu.cn',
    acc: isLocalEnv() ? buildLocalServiceUrl(4100) : 'https://acc.itestu.cn',
    auth: isLocalEnv() ? buildLocalServiceUrl(8000) : 'https://auth.itestu.cn',
    stock: isLocalEnv() ? buildLocalServiceUrl(8090) : 'https://finance.itestu.cn',
    trendaradar: isLocalEnv() ? `${getRuntimeOrigin()}/trendaradar` : 'https://trendaradar.itestu.cn',
    docs: isLocalEnv() ? buildLocalServiceUrl(8200) : 'https://doc-tools.itestu.cn',
  };
  return baseUrls;
}

function getRuntimeConfig() {
  if (typeof window === 'undefined') return {};
  return window.__KX_CONFIG__ || {};
}

function resolveCasdoorClientId() {
  const runtimeClientId = getRuntimeConfig().casdoorClientId;
  if (runtimeClientId) return runtimeClientId;
  const envClientId = typeof process !== 'undefined'
    ? process.env?.REACT_APP_CASDOOR_CLIENT_ID || process.env?.VITE_CASDOOR_CLIENT_ID || process.env?.CASDOOR_CLIENT_ID
    : '';
  if (envClientId) {
    return String(envClientId);
  }
  return '';
}

function normalizeTheme(theme) {
  if (typeof theme !== 'string') return null;
  const normalized = theme.trim().toLowerCase();
  if (SUPPORTED_THEMES.has(normalized)) return normalized;
  return LEGACY_THEME_MAP[normalized] || null;
}

export function getPreferredTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  const storedTheme = normalizeTheme(localStorage.getItem(KX_UI_THEME_KEY));
  if (storedTheme) return storedTheme;

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'night' : 'daylight';
}

export function applyTheme(theme = getPreferredTheme()) {
  if (typeof document === 'undefined') return DEFAULT_THEME;

  const normalized = normalizeTheme(theme) || DEFAULT_THEME;
  document.documentElement.dataset.theme = normalized;
  document.documentElement.style.colorScheme = normalized === 'night' ? 'dark' : 'light';
  return normalized;
}

export function setPreferredTheme(theme) {
  const normalized = normalizeTheme(theme) || DEFAULT_THEME;

  if (typeof window !== 'undefined') {
    localStorage.setItem(KX_UI_THEME_KEY, normalized);
    localStorage.setItem(KX_UI_THEME_SYNC_KEY, JSON.stringify({ theme: normalized, at: Date.now() }));
    window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
      detail: { type: 'theme_changed', data: normalized },
    }));
  }

  applyTheme(normalized);
  return normalized;
}

export function togglePreferredTheme() {
  return setPreferredTheme(getPreferredTheme() === 'night' ? 'daylight' : 'night');
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
      const payload = JSON.parse(event.newValue || '{}');
      applyAndNotify(payload.theme);
    } catch {
      applyAndNotify(getPreferredTheme());
    }
  };

  const authEventHandler = (event) => {
    if (event.detail?.type === 'theme_changed') {
      applyAndNotify(event.detail.data);
    }
  };

  window.addEventListener('storage', storageHandler);
  window.addEventListener(KX_AUTH_EVENT_KEY, authEventHandler);

  return () => {
    window.removeEventListener('storage', storageHandler);
    window.removeEventListener(KX_AUTH_EVENT_KEY, authEventHandler);
  };
}

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
    console.error('[kx-auth] Failed to parse stored token', e);
    const cookieRecord = readCookieAuthRecord();
    if (cookieRecord) {
      localStorage.setItem(KX_AUTH_TOKEN_KEY, JSON.stringify(cookieRecord));
      return cookieRecord;
    }
    return null;
  }
}

export function writeStoredAuthToken(token, expiresAt = Date.now() + 24 * 60 * 60 * 1000) {
  const data = { token, expiresAt };
  persistAuthRecord(data);

  window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
    detail: { type: 'login', data },
  }));
}

export function clearStoredAuthToken() {
  localStorage.removeItem(KX_AUTH_TOKEN_KEY);
  clearCookieValue(KX_AUTH_COOKIE_KEY);

  window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
    detail: { type: 'logout' },
  }));
}

export function isTokenValid() {
  const auth = getStoredAuthToken();
  if (!auth) return false;
  if (auth.expiresAt && new Date(auth.expiresAt) <= new Date()) {
    return false;
  }
  return true;
}

export function isAuthenticated() {
  return isTokenValid();
}

export function redirectToCasdoorLogin(returnTo = window.location.href) {
  const baseUrls = getBaseUrl();
  const loginUrl = new URL('/login/oauth/authorize', baseUrls.auth);

  const clientId = resolveCasdoorClientId();
  if (!clientId) {
    throw new Error('REACT_APP_CASDOOR_CLIENT_ID / VITE_CASDOOR_CLIENT_ID 未配置，无法使用统一认证登录');
  }

  const redirectUri = new URL('/auth/callback', window.location.origin).toString();
  const state = btoa(JSON.stringify({ returnTo }));

  loginUrl.searchParams.set('client_id', clientId);
  loginUrl.searchParams.set('response_type', 'code');
  loginUrl.searchParams.set('redirect_uri', redirectUri);
  loginUrl.searchParams.set('scope', 'read');
  loginUrl.searchParams.set('state', state);

  window.location.href = loginUrl.toString();
}

export function redirectToCasdoorLogout() {
  const baseUrls = getBaseUrl();
  const logoutUrl = new URL('/logout', baseUrls.auth);
  window.location.href = logoutUrl.toString();
}

export function getSSOToken() {
  const url = new URL(window.location.href);
  const searchToken = url.searchParams.get('sso');
  if (searchToken) {
    url.searchParams.delete('sso');
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    return searchToken;
  }

  if (window.location.hash.startsWith('#sso=')) {
    const token = window.location.hash.slice(5);
    history.replaceState(null, '', window.location.pathname + window.location.search);
    return token || null;
  }
  return null;
}

export function handleSSOLogin() {
  const ssoToken = getSSOToken();
  if (ssoToken) {
    writeStoredAuthToken(ssoToken, Date.now() + 24 * 60 * 60 * 1000);
    return true;
  }
  return false;
}

export function buildRequestOptions(options = {}) {
  const auth = getStoredAuthToken();
  const headers = new Headers(options.headers || {});

  if (auth && auth.token) {
    headers.set('Authorization', `Bearer ${auth.token}`);
  }

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'object') {
    headers.set('Content-Type', 'application/json');
  }

  return {
    credentials: 'include',
    ...options,
    headers,
  };
}

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, buildRequestOptions(options));

  if (res.status === 401) {
    clearStoredAuthToken();
    redirectToCasdoorLogin();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export function onAuthEvent(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(KX_AUTH_EVENT_KEY, handler);
  return () => window.removeEventListener(KX_AUTH_EVENT_KEY, handler);
}

export function setupAutoLogoutSync(onLogout) {
  const storageHandler = (e) => {
    if (e.key === KX_AUTH_TOKEN_KEY && !e.newValue) {
      onLogout?.();
    }
  };

  window.addEventListener('storage', storageHandler);
  return () => window.removeEventListener('storage', storageHandler);
}

export function setupTokenAutoRefresh(refreshFn, intervalMs = KX_TOKEN_REFRESH_INTERVAL) {
  let timer = null;

  const refresh = async () => {
    if (!isTokenValid()) return;

    try {
      const { token, expiresAt } = await refreshFn();
      writeStoredAuthToken(token, expiresAt);
    } catch (e) {
      console.error('[kx-auth] Failed to refresh token', e);
    }
  };

  refresh();
  timer = setInterval(refresh, intervalMs);

  return () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const KX_USER_PERMISSIONS_KEY = 'kx-user-permissions';

export function setUserPermissions(permissions) {
  localStorage.setItem(KX_USER_PERMISSIONS_KEY, JSON.stringify(permissions));

  window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
    detail: { type: 'permissions_updated', data: permissions },
  }));
}

export function getUserPermissions() {
  try {
    const stored = localStorage.getItem(KX_USER_PERMISSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('[kx-auth] Failed to parse user permissions', e);
    return [];
  }
}

export function hasPermission(permission) {
  const permissions = getUserPermissions();
  return permissions.includes(permission) || permissions.includes('*');
}

export function hasProductAccess(productKey) {
  return hasPermission(`product:${productKey}:access`);
}

export function clearUserPermissions() {
  localStorage.removeItem(KX_USER_PERMISSIONS_KEY);
}

onAuthEvent((event) => {
  if (event.type === 'logout') {
    clearUserPermissions();
  }
});

const KX_RECENT_PRODUCTS_KEY = 'kx-recent-products';
const MAX_RECENT_PRODUCTS = 5;

export function recordProductAccess(productKey, productName) {
  if (!productKey) return;

  try {
    const recentProducts = getRecentProducts();
    const filtered = recentProducts.filter((p) => p.key !== productKey);

    filtered.unshift({
      key: productKey,
      name: productName || productKey,
      timestamp: Date.now(),
    });

    const limited = filtered.slice(0, MAX_RECENT_PRODUCTS);
    localStorage.setItem(KX_RECENT_PRODUCTS_KEY, JSON.stringify(limited));

    window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
      detail: { type: 'recent_products_updated', data: limited },
    }));
  } catch (e) {
    console.error('[kx-auth] Failed to record product access', e);
  }
}

export function getRecentProducts() {
  try {
    const stored = localStorage.getItem(KX_RECENT_PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('[kx-auth] Failed to get recent products', e);
    return [];
  }
}

export function clearRecentProducts() {
  localStorage.removeItem(KX_RECENT_PRODUCTS_KEY);

  window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
    detail: { type: 'recent_products_updated', data: [] },
  }));
}

onAuthEvent((event) => {
  if (event.type === 'logout') {
    clearRecentProducts();
  }
});

const KX_CUSTOM_NAV_KEY = 'kx-custom-nav-config';

const DEFAULT_NAV_CONFIG = {
  pinnedProducts: ['memora', 'acc', 'finance'],
  hiddenProducts: [],
  quickLinks: [],
  showRecent: true,
  showAllProducts: true,
};

export function getCustomNavConfig() {
  try {
    const stored = localStorage.getItem(KX_CUSTOM_NAV_KEY);
    const userConfig = stored ? JSON.parse(stored) : {};
    return { ...DEFAULT_NAV_CONFIG, ...userConfig };
  } catch (e) {
    console.error('[kx-auth] Failed to get custom nav config', e);
    return { ...DEFAULT_NAV_CONFIG };
  }
}

export function saveCustomNavConfig(config) {
  try {
    const currentConfig = getCustomNavConfig();
    const newConfig = { ...currentConfig, ...config };

    localStorage.setItem(KX_CUSTOM_NAV_KEY, JSON.stringify(newConfig));

    window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
      detail: { type: 'custom_nav_updated', data: newConfig },
    }));

    return newConfig;
  } catch (e) {
    console.error('[kx-auth] Failed to save custom nav config', e);
    throw e;
  }
}

export function resetCustomNavConfig() {
  localStorage.removeItem(KX_CUSTOM_NAV_KEY);

  window.dispatchEvent(new CustomEvent(KX_AUTH_EVENT_KEY, {
    detail: { type: 'custom_nav_updated', data: { ...DEFAULT_NAV_CONFIG } },
  }));

  return { ...DEFAULT_NAV_CONFIG };
}

export function pinProduct(productKey) {
  const config = getCustomNavConfig();
  if (!config.pinnedProducts.includes(productKey)) {
    const newPinned = [...config.pinnedProducts, productKey].slice(0, 5);
    return saveCustomNavConfig({ pinnedProducts: newPinned });
  }
  return config;
}

export function unpinProduct(productKey) {
  const config = getCustomNavConfig();
  const newPinned = config.pinnedProducts.filter((key) => key !== productKey);
  return saveCustomNavConfig({ pinnedProducts: newPinned });
}

export function hideProduct(productKey) {
  const config = getCustomNavConfig();
  if (!config.hiddenProducts.includes(productKey)) {
    const newHidden = [...config.hiddenProducts, productKey];
    return saveCustomNavConfig({ hiddenProducts: newHidden });
  }
  return config;
}

export function showProduct(productKey) {
  const config = getCustomNavConfig();
  const newHidden = config.hiddenProducts.filter((key) => key !== productKey);
  return saveCustomNavConfig({ hiddenProducts: newHidden });
}

onAuthEvent((event) => {
  if (event.type === 'logout') {
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