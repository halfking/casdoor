import { post } from "../base";
import type { ConsentForm } from "../types";

export interface OAuthParams {
  clientId?: string;
  responseType?: string;
  redirectUri?: string;
  scope?: string;
  state?: string;
  nonce?: string;
  codeChallenge?: string;
}

export function grantConsent(consent: ConsentForm, oAuthParams?: OAuthParams) {
  const body: Record<string, unknown> = { ...consent };
  if (oAuthParams) {
    body.clientId = oAuthParams.clientId;
    body.responseType = oAuthParams.responseType;
    body.redirectUri = oAuthParams.redirectUri;
    body.scope = oAuthParams.scope;
    body.state = oAuthParams.state;
    body.nonce = oAuthParams.nonce;
    body.codeChallenge = oAuthParams.codeChallenge;
  }
  return post("/api/grant-consent", body);
}

export function revokeConsent(consent: ConsentForm) {
  return post("/api/revoke-consent", consent);
}
