import { describe, expect, it } from 'vitest'
import { classifyRequestError } from '../src/api/network.helpers'

describe('network error routing', () => {
  it('should force relogin for auth related codes', () => {
    expect(classifyRequestError({ response: { data: { code: 'GW-403' } } })).toBe('force_relogin')
    expect(classifyRequestError({ response: { data: { code: 4015 } } })).toBe('force_relogin')
  })

  it('should map status 460 to migration prompt action', () => {
    expect(classifyRequestError({ response: { status: 460, data: { code: 'GW-4600' } } })).toBe(
      'show_460'
    )
  })

  it('should fallback to generic toast action for unknown failures', () => {
    expect(classifyRequestError({ response: { status: 500, data: { code: 'GW-500' } } })).toBe('toast')
    expect(classifyRequestError(new Error('network down'))).toBe('toast')
  })
})
