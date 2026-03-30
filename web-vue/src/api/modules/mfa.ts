import { post } from "../base";

function toFormData(values: Record<string, string | undefined>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) {
    if (v !== undefined) fd.append(k, v);
  }
  return fd;
}

export interface MfaSetupValues {
  owner: string;
  name: string;
  mfaType: string;
  passcode?: string;
  secret?: string;
  dest?: string;
  countryCode?: string;
  recoveryCodes?: string;
}

export function mfaSetupInitiate(values: MfaSetupValues) {
  return post("/api/mfa/setup/initiate", toFormData({ owner: values.owner, name: values.name, mfaType: values.mfaType }), {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function mfaSetupVerify(values: MfaSetupValues) {
  return post(
    "/api/mfa/setup/verify",
    toFormData({
      owner: values.owner,
      name: values.name,
      mfaType: values.mfaType,
      passcode: values.passcode,
      secret: values.secret,
      dest: values.dest,
      countryCode: values.countryCode,
    }),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
}

export function mfaSetupEnable(values: MfaSetupValues) {
  return post(
    "/api/mfa/setup/enable",
    toFormData({
      mfaType: values.mfaType,
      owner: values.owner,
      name: values.name,
      secret: values.secret,
      recoveryCodes: values.recoveryCodes,
      dest: values.dest,
      countryCode: values.countryCode,
    }),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
}

export function deleteMfa(owner: string, name: string) {
  return post("/api/delete-mfa", toFormData({ owner, name }), {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function setPreferredMfa(mfaType: string, owner: string, name: string) {
  return post("/api/set-preferred-mfa", toFormData({ mfaType, owner, name }), {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
