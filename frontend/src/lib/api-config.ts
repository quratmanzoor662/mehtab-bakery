export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export const AUTH_TOKEN_KEY = "mehtab_admin_token";

/** Build a full media URL from a relative path stored in MongoDB. */
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${API_URL}${path}`;
  return `${API_URL}/${path}`;
}

/** Extract filename from `uploads/products/foo.jpg` for DELETE uploads. */
export function imageFilename(path: string | null | undefined): string | null {
  if (!path) return null;
  const cleaned = path.split("?")[0].replace(/\\/g, "/");
  const parts = cleaned.split("/");
  return parts[parts.length - 1] || null;
}
