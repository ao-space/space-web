import { describe, expect, it } from 'vitest'
import { createGatewayCallRequest } from '../src/api/gateway.call.helpers'

describe('gateway.call helpers', () => {
  it('should build gateway call request with default apiVersion and queries', () => {
    const req = createGatewayCallRequest({
      apiName: 'list_folders',
      serviceName: 'eulixspace-file-service'
    })

    expect(req.apiVersion).toBe('v1')
    expect(req.apiName).toBe('list_folders')
    expect(req.serviceName).toBe('eulixspace-file-service')
    expect(req.queries).toEqual({})
  })

  it('should preserve custom fields', () => {
    const req = createGatewayCallRequest({
      apiVersion: 'v2',
      apiName: 'demo_api',
      serviceName: 'demo-service',
      queries: { page: 2 },
      headers: { 'Request-Id': 'r1' },
      body: { key: 'v' }
    })

    expect(req.apiVersion).toBe('v2')
    expect(req.queries).toEqual({ page: 2 })
    expect(req.headers).toEqual({ 'Request-Id': 'r1' })
    expect(req.body).toEqual({ key: 'v' })
  })
})
