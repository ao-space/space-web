import { describe, expect, it } from 'vitest'
import { isSwitchLoginQueryValid } from '../src/pages/login/switchLogin.helpers'

describe('switch login helpers', () => {
  it('should accept complete switch login query', () => {
    expect(
      isSwitchLoginQueryValid({
        eluoxaeskey: 'aes-key',
        serPubkey: 'pub-key',
        language: 'zh-CN',
        loginInfo: '{"token":"x"}'
      })
    ).toBe(true)
  })

  it('should reject missing mandatory fields', () => {
    expect(
      isSwitchLoginQueryValid({
        eluoxaeskey: 'aes-key',
        serPubkey: '',
        language: 'zh-CN',
        loginInfo: '{"token":"x"}'
      })
    ).toBe(false)
  })
})
