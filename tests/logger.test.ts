import { afterEach, describe, expect, it } from 'vitest'
import { __setLogLevelForTest, redactForLog } from '../src/utils/logger'

describe('logger redaction', () => {
  afterEach(() => {
    __setLogLevelForTest(null)
  })

  it('should redact sensitive keys', () => {
    const redacted = redactForLog({
      accessToken: 'abcdef1234567890',
      nested: {
        password: 'change_me',
        message: 'ok'
      }
    }) as Record<string, unknown>

    expect(redacted.accessToken).toBe('abcd***90')
    expect((redacted.nested as Record<string, unknown>).password).toBe('chan***me')
    expect((redacted.nested as Record<string, unknown>).message).toBe('ok')
  })

  it('should keep plain values unchanged', () => {
    expect(redactForLog('plain-text')).toBe('plain-text')
    expect(redactForLog(1)).toBe(1)
  })
})

