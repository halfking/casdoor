// Auth utility functions ported from Casdoor React frontend

/**
 * Decode base64 state parameter to get query string
 */
export function getQueryParamsFromState(state: string | null): string {
  if (!state) return ''
  try {
    // Try base64 decode
    const decoded = atob(state)
    // Check if it looks like a query string
    if (decoded.startsWith('?') || decoded.includes('=')) {
      return decoded
    }
    // Try JSON parse (some providers encode JSON in state)
    const json = JSON.parse(decoded)
    if (json.redirect_uri) {
      const params = new URLSearchParams()
      for (const [k, v] of Object.entries(json)) {
        params.set(k, String(v))
      }
      return params.toString()
    }
    return decoded
  } catch {
    return ''
  }
}

/**
 * Extract OAuth parameters from inner URL params
 */
export function getOAuthGetParameters(innerParams: URLSearchParams): {
  redirectUri: string | null
  state: string | null
  clientId: string | null
  responseType: string | null
  scope: string | null
  responseMode: string | null
  relayState: string | null
} | null {
  const redirectUri = innerParams.get('redirect_uri') || innerParams.get('redirect_url')
  if (!redirectUri) return null

  return {
    redirectUri,
    state: innerParams.get('state'),
    clientId: innerParams.get('client_id'),
    responseType: innerParams.get('response_type'),
    scope: innerParams.get('scope'),
    responseMode: innerParams.get('response_mode'),
    relayState: innerParams.get('relayState') || innerParams.get('relay_state'),
  }
}

/**
 * Get the link to redirect to after login
 */
export function getFromLink(search?: string): string {
  const url = new URL(window.location.href)
  const redirectUri = url.searchParams.get('redirect_uri') || url.searchParams.get('redirect_url')
  if (redirectUri) return redirectUri
  const from = search
    ? new URLSearchParams(search).get('from')
    : new URLSearchParams(window.location.search).get('from')
  if (from) return from
  const stored = sessionStorage.getItem('from')
  if (stored) return stored
  return 'https://www.itestu.cn'
}

/**
 * Navigate to a URL
 */
export function goToLink(url: string) {
  window.location.href = url
}

/**
 * Create a hidden form and submit it (for form_post response mode)
 */
export function createFormAndSubmit(url: string, params: Record<string, any>) {
  const form = document.createElement('form')
  form.action = url
  form.method = 'POST'
  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = String(value)
      form.appendChild(input)
    }
  }
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}
