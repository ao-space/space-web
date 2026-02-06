import { describe, expect, it } from 'vitest'
import {
  appendTimestampParam,
  buildQueryUrl,
  extractRedirectOrigin,
  shouldForceRelogin
} from '../src/api/network.helpers'

describe('network.helpers', () => {
  it('should detect relogin-required error codes', () => {
    expect(shouldForceRelogin('GW-403')).toBe(true)
    expect(shouldForceRelogin('GW-4015')).toBe(true)
    expect(shouldForceRelogin(4015)).toBe(true)
    expect(shouldForceRelogin('GW-200')).toBe(false)
  })

  it('should append timestamp query parameter', () => {
    expect(appendTimestampParam('/space/status', 123)).toBe('/space/status?t=123')
    expect(appendTimestampParam('/space/status?a=1', 456)).toBe('/space/status?a=1&t=456')
  })

  it('should build query url with encoding', () => {
    const result = buildQueryUrl('/space/v1/api/file/list', {
      page: 1,
      keyword: 'a b',
      nullable: null
    })
    expect(result).toBe('/space/v1/api/file/list?page=1&keyword=a%20b')
  })

  it('should extract redirect origin only when changed', () => {
    expect(extractRedirectOrigin('http://192.168.1.10', 'http://192.168.1.10/space/status')).toBe(null)
    expect(extractRedirectOrigin('http://192.168.1.10', 'https://ao.space/space/status')).toBe(
      'https://ao.space'
    )
    expect(extractRedirectOrigin('http://192.168.1.10', 'not-a-url')).toBe(null)
  })
})

