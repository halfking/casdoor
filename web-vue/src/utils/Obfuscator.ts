// Password obfuscation utility — ported from web/src/auth/Obfuscator.js
// Uses crypto-js for DES/AES CBC encryption with random IV
import CryptoJS from "crypto-js";

export type ObfuscatorType = "DES" | "AES" | "";

export const passwordObfuscatorKeyRegexes: Record<string, RegExp> = {
  DES: /^[1-9a-f]{16}$/,
  AES: /^[1-9a-f]{32}$/,
};

/**
 * Generate a random hex key for the given obfuscator type.
 */
export function getRandomKeyForObfuscator(type: ObfuscatorType): string {
  const len = type === "DES" ? 16 : 32;
  let key = "";
  while (key.length < len) {
    key += Math.floor(Math.random() * 15 + 1).toString(16);
  }
  return key.substring(0, len);
}

/**
 * Check whether the obfuscator configuration is valid.
 * Returns an error message string, or empty string if valid.
 */
export function checkPasswordObfuscator(type: string, key: string): string {
  if (!type || type === "") {
    return "Password obfuscator type is empty";
  }
  if (type !== "DES" && type !== "AES") {
    return `Unsupported password obfuscator type: ${type}`;
  }
  const regex = passwordObfuscatorKeyRegexes[type];
  if (!regex.test(key)) {
    return `Invalid ${type} key. Expected ${type === "DES" ? 16 : 32} hex chars (1-9, a-f)`;
  }
  return "";
}

/**
 * Encrypt a password using the configured obfuscator (AES-CBC or DES-CBC).
 * Returns [encryptedHex, errorMessage]. errorMessage is empty on success.
 */
export function encryptByPasswordObfuscator(
  type: string,
  key: string,
  password: string
): [string, string] {
  if (!type || type === "" || !key || key === "") {
    return [password, ""];
  }

  const err = checkPasswordObfuscator(type, key);
  if (err) {
    return ["", err];
  }

  const keyWords = CryptoJS.enc.Hex.parse(key);

  const ivLen = type === "DES" ? 8 : 16;
  const iv = CryptoJS.lib.WordArray.random(ivLen);

  const cfg = {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  };

  let encrypted: CryptoJS.lib.CipherParams;
  if (type === "DES") {
    encrypted = CryptoJS.DES.encrypt(password, keyWords, cfg);
  } else {
    encrypted = CryptoJS.AES.encrypt(password, keyWords, cfg);
  }

  // Prepend IV to ciphertext, output as hex
  const result = iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Hex);
  return [result, ""];
}
