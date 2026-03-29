function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

export function saveCodeVerifier(state: string, verifier: string): void {
  localStorage.setItem(`pkce_verifier_${state}`, verifier);
}

export function getCodeVerifier(state: string | null): string | null {
  if (!state) {
    return null;
  }

  return localStorage.getItem(`pkce_verifier_${state}`);
}

export function clearCodeVerifier(state: string | null): void {
  if (!state) {
    return;
  }

  localStorage.removeItem(`pkce_verifier_${state}`);
}
