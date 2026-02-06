type LogLevelName = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const LOG_LEVEL_WEIGHT: Record<LogLevelName, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 99
}

const SENSITIVE_KEY_PATTERNS = [
  /token/i,
  /secret/i,
  /password/i,
  /key/i,
  /authorization/i,
  /cookie/i
]

let levelOverride: LogLevelName | null = null

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeLevel(value: unknown): LogLevelName {
  if (typeof value !== 'string') return 'info'
  const level = value.toLowerCase().trim() as LogLevelName
  if (level in LOG_LEVEL_WEIGHT) return level
  return 'info'
}

function readConfiguredLevel(): LogLevelName {
  if (levelOverride) return levelOverride

  try {
    if (typeof localStorage !== 'undefined') {
      const explicit = localStorage.getItem('APP_LOG_LEVEL')
      if (explicit) return normalizeLevel(explicit)
      const showLog = localStorage.getItem('showLog')
      if (showLog === '1') return 'debug'
    }
  } catch (_error) {
    // no-op
  }

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
      return 'debug'
    }
  } catch (_error) {
    // no-op
  }

  return 'info'
}

function maskText(value: string): string {
  if (value.length <= 8) return '***'
  return `${value.slice(0, 4)}***${value.slice(-2)}`
}

function shouldMaskKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key))
}

function redactValue(value: unknown, depth: number): unknown {
  if (depth > 5) return '[MaxDepth]'
  if (Array.isArray(value)) return value.map((item) => redactValue(item, depth + 1))
  if (!isObject(value)) return value

  const output: Record<string, unknown> = {}
  Object.keys(value).forEach((key) => {
    const raw = value[key]
    if (raw === undefined) return
    if (shouldMaskKey(key) && typeof raw === 'string') {
      output[key] = maskText(raw)
      return
    }
    if (shouldMaskKey(key) && (typeof raw === 'number' || typeof raw === 'boolean')) {
      output[key] = '***'
      return
    }
    output[key] = redactValue(raw, depth + 1)
  })
  return output
}

export function redactForLog(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack
    }
  }
  if (typeof value === 'string') return value
  return redactValue(value, 0)
}

function shouldLog(level: LogLevelName): boolean {
  const configured = readConfiguredLevel()
  return LOG_LEVEL_WEIGHT[level] >= LOG_LEVEL_WEIGHT[configured]
}

function write(method: 'debug' | 'info' | 'warn' | 'error', message: string, payload?: unknown): void {
  if (!shouldLog(method)) return
  const prefix = `[space-web][${method.toUpperCase()}]`
  if (payload === undefined) {
    console[method](`${prefix} ${message}`)
    return
  }
  console[method](`${prefix} ${message}`, redactForLog(payload))
}

export const logger = {
  debug(message: string, payload?: unknown): void {
    write('debug', message, payload)
  },
  info(message: string, payload?: unknown): void {
    write('info', message, payload)
  },
  warn(message: string, payload?: unknown): void {
    write('warn', message, payload)
  },
  error(message: string, payload?: unknown): void {
    write('error', message, payload)
  }
}

export function __setLogLevelForTest(level: LogLevelName | null): void {
  levelOverride = level
}

