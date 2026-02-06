export function shouldForceRelogin(code: unknown): boolean {
  return code === 'GW-403' || code === 'GW-4015' || code === 4015
}

export type RequestErrorAction = 'force_relogin' | 'show_460' | 'toast'

export function classifyRequestError(error: unknown): RequestErrorAction {
  const status = (error as any)?.response?.status
  const code = (error as any)?.response?.data?.code

  if (shouldForceRelogin(code)) return 'force_relogin'
  if (status === 460) return 'show_460'
  return 'toast'
}

export function appendTimestampParam(url: string, timestamp: number = Date.now()): string {
  const separator = url.indexOf('?') >= 0 ? '&' : '?'
  return `${url}${separator}t=${timestamp}`
}

export function buildQueryUrl(url: string, params: Record<string, unknown> = {}): string {
  const query: string[] = []
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value === undefined || value === null) return
    query.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  })

  if (query.length === 0) return url
  const separator = url.indexOf('?') >= 0 ? '&' : '?'
  return `${url}${separator}${query.join('&')}`
}

export function extractRedirectOrigin(currentOrigin: string, responseURL: string): string | null {
  if (!responseURL) return null
  try {
    const target = new URL(responseURL)
    if (target.origin === currentOrigin) return null
    return target.origin
  } catch (_error) {
    return null
  }
}
