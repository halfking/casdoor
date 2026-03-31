import { get, post } from "../base";

/* ───────── Base64URL <-> ArrayBuffer helpers ───────── */

export function webAuthnBufferDecode(value: string): Uint8Array {
  value = value.replace(/-/g, "+").replace(/_/g, "/");
  while (value.length % 4) {
    value += "=";
  }
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

export function webAuthnBufferEncode(value: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/* ───────── register (GET begin → navigator.credentials.create → POST finish) ───────── */

export async function registerWebauthnCredential() {
  const credentialCreationOptions = await get<{
    publicKey: PublicKeyCredentialCreationOptions & { challenge: string; user: { id: string } };
  }>("/api/webauthn/signup/begin").then((res) => res.data) as unknown as {
    publicKey: PublicKeyCredentialCreationOptions & { challenge: string; user: { id: string }; excludeCredentials?: Array<{ id: string }> };
  };

  (credentialCreationOptions.publicKey as any).challenge = webAuthnBufferDecode(
    credentialCreationOptions.publicKey.challenge as unknown as string
  );
  (credentialCreationOptions.publicKey.user as any).id = webAuthnBufferDecode(
    credentialCreationOptions.publicKey.user.id as unknown as string
  );
  if (credentialCreationOptions.publicKey.excludeCredentials) {
    for (const cred of credentialCreationOptions.publicKey.excludeCredentials) {
      (cred as any).id = webAuthnBufferDecode(cred.id as unknown as string);
    }
  }

  const credential = (await navigator.credentials.create({
    publicKey: credentialCreationOptions.publicKey as unknown as PublicKeyCredentialCreationOptions,
  })) as PublicKeyCredential;

  const response = credential.response as AuthenticatorAttestationResponse;

  return post("/api/webauthn/signup/finish", {
    id: credential.id,
    rawId: webAuthnBufferEncode(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: webAuthnBufferEncode(response.attestationObject),
      clientDataJSON: webAuthnBufferEncode(response.clientDataJSON),
    },
  });
}

/* ───────── delete credential ───────── */

export function deleteUserWebAuthnCredential(credentialID: string) {
  const fd = new FormData();
  fd.append("credentialID", credentialID);
  return post("/api/webauthn/delete-credential", fd);
}
