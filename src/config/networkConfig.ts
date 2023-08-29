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

import { isDev } from '@/utils/help'
import eventBus from '@/utils/eventbus'
import { keyMap } from '@/utils/constant'
import { getDevConfig } from '@/../vite-dev'

/**
 * 不需要加密的url
 * */
export let noCryptArray = [
  '/space/v1/api/gateway/auth/token/create',
  '/space/v1/api/auth/bkey/verify',
  '/space/box/publicKey.pem',
  '/space/v1/api/auth/bkey/refresh',
  '/space/v1/api/gateway/poll',
  '/space/v1/api/auth/auto/login/poll',
  'space/v1/api/auth/auto/login',
  '/space/status',
  '/space/v2/api/gateway/totp/bkey',
  '/space/v2/api/gateway/totp/bkey/poll',
  '/space/v2/api/gateway/totp/verify'
]

/**
 * 错误自己处理的url
 */
export let errorDealSelfArray = ['/space/v1/api/auth/bkey/verify']

/**
 * 项目中共2个超时时间,一个是axios请求接口,一个是xhr上传和下载4M文件超时时间
 */
// 超时时间 90 秒
export let axiosTimeout = 90 * 1000

// 上传下载文件超时时间
export let xhrUpLoadTimeout = 90 * 1000



let userUrlIdentify = ''


export let origin = window.location.origin

let platformUrl = ''
export const setPlatformUrl = (url) => {
  platformUrl = url
}


export let urlConfig = {
  baseUrl: '',
  get platformUrl() {
    return platformUrl
  }, // 平台url
  get urlIdentify() {
    return userUrlIdentify
  },

}

if (isDev()) {
  //本地
  origin = 'https://bybw6n0v.dev-space.eulix.xyz/'

  urlConfig.baseUrl = ''
  userUrlIdentify = getDevConfig().userUrlIdentify
} else {
  userUrlIdentify = getUserUrlIdentify(origin)
}



function getUserUrlIdentify(userOrigin) {
  let matchUrl = userOrigin.match(/https:\/\/([a-zA-Z0-9]+)\./)
  let urlIdentify = matchUrl && matchUrl[1]
  return urlIdentify
}

let flag307 = false
export function deal307Event(responseURL, config) {
  if (config && config.url && config.url.indexOf('/space/status?not307=yes') > 0) {
    return
  }
  if (!flag307) {
    const origin = window.location.origin
    const newUrl = new URL(responseURL)
    let newOrigin = newUrl.origin
    if (origin != newOrigin) {
      console.log(config)
      flag307 = true
      eventBus.$emit(keyMap.eventOf307, { origin: newOrigin })
    }
  }
}
