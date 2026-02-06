export type SwitchLoginQuery = {
  eluoxaeskey?: unknown
  serPubkey?: unknown
  language?: unknown
  loginInfo?: unknown
  client_uuid?: unknown
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isSwitchLoginQueryValid(query: SwitchLoginQuery): boolean {
  return (
    isNonEmptyString(query.eluoxaeskey) &&
    isNonEmptyString(query.serPubkey) &&
    isNonEmptyString(query.language) &&
    isNonEmptyString(query.loginInfo)
  )
}
