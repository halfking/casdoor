import request from './request'

export async function registerWebauthnCredential() {
  const credentialCreationOptions = await request.get('/api/webauthn/signup/begin')
  credentialCreationOptions.publicKey.challenge = webAuthnBufferDecode(credentialCreationOptions.publicKey.challenge)
  credentialCreationOptions.publicKey.user.id = webAuthnBufferDecode(credentialCreationOptions.publicKey.user.id)

  if (credentialCreationOptions.publicKey.excludeCredentials) {
    for (let i = 0; i < credentialCreationOptions.publicKey.excludeCredentials.length; i++) {
      credentialCreationOptions.publicKey.excludeCredentials[i].id = webAuthnBufferDecode(credentialCreationOptions.publicKey.excludeCredentials[i].id)
    }
  }

  const credential = await navigator.credentials.create({
    publicKey: credentialCreationOptions.publicKey,
  }) as PublicKeyCredential | null

  if (!credential) {
    throw new Error('Failed to create WebAuthn credential')
  }

  const response = credential.response as AuthenticatorAttestationResponse
  return request.post('/api/webauthn/signup/finish', {
    id: credential.id,
    rawId: webAuthnBufferEncode(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: webAuthnBufferEncode(response.attestationObject),
      clientDataJSON: webAuthnBufferEncode(response.clientDataJSON),
    },
  })
}

export function deleteUserWebAuthnCredential(credentialID: string) {
  const form = new FormData()
  form.append('credentialID', credentialID)
  return request.post('/api/webauthn/delete-credential', form)
}

export function webAuthnBufferDecode(value: string) {
  value = value.replace(/-/g, '+').replace(/_/g, '/')
  while (value.length % 4) {
    value += '='
  }
  return Uint8Array.from(atob(value), c => c.charCodeAt(0))
}

export function webAuthnBufferEncode(value: ArrayBufferLike) {
  const bytes = new Uint8Array(value)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
