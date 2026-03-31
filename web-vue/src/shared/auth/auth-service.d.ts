export interface AuthToken {
  token: string;
  expiresAt: number;
}

export interface AuthEvent {
  type: string;
  data?: unknown;
}

export declare function getPreferredTheme(): 'daylight' | 'night';
export declare function applyTheme(theme?: string): 'daylight' | 'night';
export declare function setPreferredTheme(theme: string): 'daylight' | 'night';
export declare function togglePreferredTheme(): 'daylight' | 'night';
export declare function setupThemeSync(onThemeChange?: (theme: 'daylight' | 'night') => void): () => void;
export declare function getStoredAuthToken(): AuthToken | null;
export declare function writeStoredAuthToken(token: string, expiresAt?: number): void;
export declare function clearStoredAuthToken(): void;
export declare function isTokenValid(): boolean;
export declare function isAuthenticated(): boolean;
export declare function redirectToCasdoorLogin(returnTo?: string): void;
export declare function redirectToCasdoorLogout(): void;
export declare function getSSOToken(): string | null;
export declare function handleSSOLogin(): boolean;
export declare function buildRequestOptions(options?: RequestInit): RequestInit;
export declare function apiFetch<T = unknown>(url: string, options?: RequestInit): Promise<T>;
export declare function onAuthEvent(callback: (event: AuthEvent) => void): () => void;
export declare function setupAutoLogoutSync(onLogout: () => void): () => void;
export declare function setupTokenAutoRefresh(refreshFn: () => Promise<{ token: string; expiresAt: number }>, intervalMs?: number): () => void;
export declare function isLocalEnv(): boolean;
export declare function getBaseUrl(): Record<string, string>;
export declare function setUserPermissions(permissions: string[]): void;
export declare function getUserPermissions(): string[];
export declare function hasPermission(permission: string): boolean;
export declare function hasProductAccess(productKey: string): boolean;
export declare function clearUserPermissions(): void;
export declare function recordProductAccess(productKey: string, productName?: string): void;
export declare function getRecentProducts(): Array<{ key: string; name: string; timestamp: number }>;
export declare function clearRecentProducts(): void;
export declare function getCustomNavConfig(): {
  pinnedProducts: string[];
  hiddenProducts: string[];
  quickLinks: string[];
  showRecent: boolean;
  showAllProducts: boolean;
};
export declare function saveCustomNavConfig(config: Record<string, unknown>): Record<string, unknown>;
export declare function resetCustomNavConfig(): Record<string, unknown>;
export declare function pinProduct(productKey: string): Record<string, unknown>;
export declare function unpinProduct(productKey: string): Record<string, unknown>;
export declare function hideProduct(productKey: string): Record<string, unknown>;
export declare function showProduct(productKey: string): Record<string, unknown>;

declare const authService: {
  getPreferredTheme: typeof getPreferredTheme;
  applyTheme: typeof applyTheme;
  setPreferredTheme: typeof setPreferredTheme;
  togglePreferredTheme: typeof togglePreferredTheme;
  setupThemeSync: typeof setupThemeSync;
  getStoredAuthToken: typeof getStoredAuthToken;
  writeStoredAuthToken: typeof writeStoredAuthToken;
  clearStoredAuthToken: typeof clearStoredAuthToken;
  isTokenValid: typeof isTokenValid;
  isAuthenticated: typeof isAuthenticated;
  redirectToCasdoorLogin: typeof redirectToCasdoorLogin;
  redirectToCasdoorLogout: typeof redirectToCasdoorLogout;
  getSSOToken: typeof getSSOToken;
  handleSSOLogin: typeof handleSSOLogin;
  buildRequestOptions: typeof buildRequestOptions;
  apiFetch: typeof apiFetch;
  onAuthEvent: typeof onAuthEvent;
  setupAutoLogoutSync: typeof setupAutoLogoutSync;
  setupTokenAutoRefresh: typeof setupTokenAutoRefresh;
  isLocalEnv: typeof isLocalEnv;
  getBaseUrl: typeof getBaseUrl;
  setUserPermissions: typeof setUserPermissions;
  getUserPermissions: typeof getUserPermissions;
  hasPermission: typeof hasPermission;
  hasProductAccess: typeof hasProductAccess;
  clearUserPermissions: typeof clearUserPermissions;
  recordProductAccess: typeof recordProductAccess;
  getRecentProducts: typeof getRecentProducts;
  clearRecentProducts: typeof clearRecentProducts;
  getCustomNavConfig: typeof getCustomNavConfig;
  saveCustomNavConfig: typeof saveCustomNavConfig;
  resetCustomNavConfig: typeof resetCustomNavConfig;
  pinProduct: typeof pinProduct;
  unpinProduct: typeof unpinProduct;
  hideProduct: typeof hideProduct;
  showProduct: typeof showProduct;
};

export default authService;