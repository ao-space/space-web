import { RealCallRequest } from './model'

export type GatewayCallOptions<TQuery = Record<string, unknown>, TBody = unknown> = {
  apiName: string
  serviceName: string
  apiVersion?: string
  queries?: TQuery
  headers?: Record<string, unknown>
  body?: TBody
}

export function createGatewayCallRequest<TQuery = Record<string, unknown>, TBody = unknown>(
  options: GatewayCallOptions<TQuery, TBody>
): RealCallRequest<TQuery, TBody> {
  const {
    apiName,
    serviceName,
    apiVersion = 'v1',
    queries = {} as TQuery,
    headers,
    body
  } = options

  return {
    apiVersion,
    apiName,
    serviceName,
    queries,
    headers,
    body
  }
}
