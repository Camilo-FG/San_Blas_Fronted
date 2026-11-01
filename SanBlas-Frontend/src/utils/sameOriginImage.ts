/** Hosts que inyectan cookies de terceros al cargar <img> directo. */
const PROXY_HOSTS = new Set(["res.cloudinary.com"]);

function shouldProxyRemoteImages(): boolean {
  if (!import.meta.env.PROD) return false;
  if (typeof window === "undefined") return true;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

/**
 * Sirve imágenes remotas (Cloudinary) vía `/.netlify/images` para que el
 * navegador no reciba cookies de terceros (Lighthouse Best Practices).
 */
export function sameOriginImage(
  src: string,
  options?: { width?: number; quality?: number },
): string {
  const trimmed = src.trim();
  if (!trimmed || !shouldProxyRemoteImages()) return trimmed;

  let hostname: string;
  try {
    hostname = new URL(trimmed).hostname;
  } catch {
    return trimmed;
  }
  if (!PROXY_HOSTS.has(hostname)) return trimmed;

  const params = new URLSearchParams({
    url: trimmed,
    q: String(options?.quality ?? 80),
  });
  if (options?.width) params.set("w", String(options.width));
  return `/.netlify/images?${params.toString()}`;
}
