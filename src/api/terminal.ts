/*
 * Copyright (c) 2022 Institute of Software Chinese Academy of Sciences (ISCAS)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * 终端的一些操作
 */

import { post } from './network.js'
import { RealCallRequest, FileParam } from './model'

import { urlConfig } from '@/config/networkConfig'
let baseUrl = urlConfig.baseUrl

/**
 * 通知终端下线 在退出时调用
 */
export function terminalLogout(queryParam) {
  let result
  // todo 这里需要优化
  let params: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'terminal_logout',
    serviceName: 'eulixspace-account-service',
    queries: queryParam,
  }

  result = post(`${baseUrl}/space/v1/api/gateway/call`, params)
  return result
}

/**
 * 获得登录的终端信息
 */
export function terminalAllInfo() {
  let result
  // todo 这里需要优化
  let params: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'terminal_info_all_show',
    serviceName: 'eulixspace-account-service',
  }

  result = post(`${baseUrl}/space/v1/api/gateway/call`, params)
  return result
}

/**
 * 下线终端
 */
export function terminalInfoDelete(queryParam) {
  let result
  // todo 这里需要优化
  let params: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'terminal_info_delete',
    serviceName: 'eulixspace-account-service',
    queries: queryParam,
  }

  result = post(`${baseUrl}/space/v1/api/gateway/call`, params)
  return result
}

/**
 * 获得绑定终端信息
 */
export function getTerminalInfo() {
  // todo 这里需要优化
  let params: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'personalinfo_show',
    serviceName: 'eulixspace-account-service',
  }

  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}
