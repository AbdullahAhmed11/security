/** Backend origin, e.g. https://securityback.onrender.com */
export function getApiOrigin(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  if (!raw) return ''
  return raw.replace(/\/+$/, '')
}

/** API prefix including /api */
export function getApiBase(): string {
  const origin = getApiOrigin()
  return origin ? `${origin}/api` : '/api'
}

/** Turn relative /api/... file URLs into absolute when using a remote backend */
export function resolveApiUrl(url: string): string {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  const origin = getApiOrigin()
  if (!origin) return url
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`
}
