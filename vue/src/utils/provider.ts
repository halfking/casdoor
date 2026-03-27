// PKCE utilities ported from Casdoor React Provider.js

const CODE_VERIFIER_PREFIX = 'casdoor_pkce_'

/**
 * Generate a random code verifier string (43-128 chars, unreserved chars)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64URLEncode(array)
}

/**
 * Generate code challenge from verifier using SHA-256
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64URLEncode(new Uint8Array(hash))
}

/**
 * Save code verifier to localStorage keyed by state
 */
export function saveCodeVerifier(state: string | null, verifier: string) {
  if (state) {
    localStorage.setItem(`${CODE_VERIFIER_PREFIX}${state}`, verifier)
  }
}

/**
 * Get code verifier from localStorage by state
 */
export function getCodeVerifier(state: string | null): string | null {
  if (!state) return null
  return localStorage.getItem(`${CODE_VERIFIER_PREFIX}${state}`)
}

/**
 * Clear stored code verifier
 */
export function clearCodeVerifier(state: string | null) {
  if (state) {
    localStorage.removeItem(`${CODE_VERIFIER_PREFIX}${state}`)
  }
}

function base64URLEncode(array: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
