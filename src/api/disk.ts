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

import { post} from './network.js'
import { urlConfig } from '@/config/networkConfig'
import { FileParam, RealCallRequest } from '@/api/model'
import {cacheNetWorkResultInIndexDb} from '@/utils/indexdbUtil'

let baseUrl = urlConfig.baseUrl



/**
 * 查询设备能力
 */
export function deviceAbility() {
  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'device_ability',
    serviceName: 'eulixspace-agent-service'
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

// 设备能力缓存24小时
export const getDeviceAbilityWithCache = cacheNetWorkResultInIndexDb('ao-deviceability',deviceAbility,24*60*60*1000)
