import DOMPurify from "dompurify";

const CSS_BLOCKLIST_PATTERNS = [
  /@import/gi,
  /expression\s*\(/gi,
  /behavior\s*:/gi,
  /-moz-binding\s*:/gi,
  /url\s*\(\s*["']?\s*(?:javascript|vbscript|data:text\/html)/gi,
];

export function sanitizeHtml(html) {
  if (typeof html !== "string" || html.trim() === "") {
    return "";
  }

  return DOMPurify.sanitize(html, {
    USE_PROFILES: {html: true},
  });
}

export function sanitizeStyleText(styleText) {
  if (typeof styleText !== "string" || styleText.trim() === "") {
    return "";
  }

  let safeStyleText = styleText.replaceAll(/<\/?style>/gi, "").trim();
  for (const pattern of CSS_BLOCKLIST_PATTERNS) {
    safeStyleText = safeStyleText.replaceAll(pattern, "");
  }

  return safeStyleText.trim();
}

export function sanitizeUrl(url) {
  if (typeof url !== "string" || url.trim() === "") {
    return "";
  }

  const sanitized = url.trim();
  if (sanitized.startsWith("/") || sanitized.startsWith("./") || sanitized.startsWith("../")) {
    return sanitized;
  }

  try {
    const parsedUrl = new URL(sanitized, window.location.origin);
    if (["http:", "https:", "mailto:", "tel:"].includes(parsedUrl.protocol)) {
      return parsedUrl.toString();
    }
  } catch {
    return "";
  }

  return "";
}
