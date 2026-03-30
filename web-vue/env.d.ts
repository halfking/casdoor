/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// ── Shared library (resolved at runtime by Vite alias) ──

declare module '@kx/shared/components/SharedNavbar.vue' {
  import type { DefineComponent } from 'vue'
  interface NavLink { label: string; href: string; isActive?: boolean }
  const SharedNavbar: DefineComponent<{
    appName?: string
    appLinks?: NavLink[]
    isAuthenticated?: boolean
    authToken?: string | null
    hidePortalNav?: boolean
  }, {}, any>
  export default SharedNavbar
}

declare module '@kx/shared/auth/auth-service.js' {
  export function getPreferredTheme(): string
  export function applyTheme(theme: string): void
  export function setPreferredTheme(theme: string): void
  export function togglePreferredTheme(): void
  export function setupThemeSync(): void
  export function getStoredAuthToken(): string | null
  export function writeStoredAuthToken(token: string): void
  export function clearStoredAuthToken(): void
  export function isTokenValid(token: string): boolean
  export function isAuthenticated(): boolean
  export function redirectToCasdoorLogin(options?: Record<string, string>): void
  export function redirectToCasdoorLogout(): void
  export function getSSOToken(): string | null
  export function handleSSOLogin(): boolean
  export function buildRequestOptions(options?: RequestInit): RequestInit
  export function apiFetch(url: string, options?: RequestInit): Promise<Response>
  export function onAuthEvent(callback: (e: CustomEvent) => void): () => void
  export function setupAutoLogoutSync(): void
  export function setupTokenAutoRefresh(): void
  export function setUserPermissions(perms: string[]): void
  export function getUserPermissions(): string[]
  export function hasPermission(perm: string): boolean
  export function recordProductAccess(productId: string): void
  export function getRecentProducts(): string[]
  export function getCustomNavConfig(): Record<string, unknown>
}

declare module '@kx/shared/navigation/unified-links' {
  export interface UnifiedLink { label: string; href: string; icon?: string; group?: string }
  export function getUnifiedLinks(): UnifiedLink[]
}

declare module '@kaixuan/shared/auth/auth-service' {
  export * from '@kx/shared/auth/auth-service.js'
}

declare module '@kaixuan/shared/navigation/unified-links' {
  export * from '@kx/shared/navigation/unified-links'
}
