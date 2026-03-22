import DOMPurify from "dompurify";

export function sanitizeHtml(html) {
  if (typeof html !== "string" || html.trim() === "") {
    return "";
  }

  return DOMPurify.sanitize(html, {
    USE_PROFILES: {html: true},
  });
}
