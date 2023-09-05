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

import { keyMap } from '@/utils/constant'
import { getAoidFormLoginInfo } from '@/auth/index'
import SparkMD5 from 'spark-md5'
import { postMessageToIframe } from '@/utils/iframeUtils'
import { Cookie } from '@/utils/help'



/**
 * 封装登录逻辑
 */

/**
 * 退出登录时不需要清除的localstorage信息
 * clientUUID => 区分同一客户端的标识
 * webUrl => 官网地址
 * loginInfo => 用来获得refreshtoken 及用户信息,在免扫描登录中用到
 * lastScanQrCodeTime => 最近一次扫码时间
 * __getPersonal__ => 用户基本信息 存aoid 及其他等
 * serPubkey => 服务端rsa 公钥
 */
const unneedClearKeyDefaultValueArray = [
  { key: keyMap.clientUUID, defaultValue: null },
  { key: keyMap.webUrl, defaultValue: 'https://ao.space' },
  { key: keyMap.lastScanQrCodeTime },
  { key: keyMap.__getPersonal__ },
  { key: keyMap.serPubkey },
  { key: keyMap.eluoxaeskey },
  { key: keyMap.language },
  { key: keyMap.refreshToken },
  { key: keyMap.boxLanInfo },
  { key: keyMap.showLog },
  { key: keyMap.serviceConfig}
]

export function getPersonalCache() {
  try {
    return JSON.parse(localStorage.getItem(keyMap.__getPersonal__))
  } catch (e) {
    return null
  }
}

export function setPersonalCache(result) {
  localStorage.setItem(keyMap.__getPersonal__, JSON.stringify(result))
}

/**
 * 退出登录的逻辑
 */
export function clearLoginInfoAndgoSpace() {
  // 把不需要删除的信息保存下来
  clearLoginInfo()

  // 去免扫描登录页面
  location.hash = '#/noscanLogin'
}

/**
 * 退出登录的逻辑
 */
export function clearLoginInfo() {
  // 把不需要删除的信息保存下来
  const unneedCleartKeyValues = []
  unneedClearKeyDefaultValueArray.forEach((keyAndDefaultValue) => {
    const key = keyAndDefaultValue.key
    let value = localStorage.getItem(key)
    if (
      !value &&
      keyAndDefaultValue.defaultValue !== null &&
      keyAndDefaultValue.defaultValue !== undefined
    ) {
      value = keyAndDefaultValue.defaultValue
    }
    unneedCleartKeyValues.push({ key: key, value: value })
  })

  localStorage.removeItem('eluoxaccessToken') // 为了触发dealStorageChange，不能删除
  localStorage.clear()

  // 恢复不需要删除的信息
  unneedCleartKeyValues.forEach((item) => {
    const { key, value } = item
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, value)
    }
  })
}

export function isAdmin() {
  const personal = getPersonalCache()
  return (
    personal &&
    personal.results &&
    personal.results[0] &&
    personal.results[0].role === 'ADMINISTRATOR'
  )
}

export function getAoid() {
  const personInfo = getPersonInfo()
  let aoid = personInfo.aoId
  if (!aoid) {
    aoid = getAoidFormLoginInfo()
  }
  return aoid
}

/**
 * 无需加密时的token
 */
export function genNocryToken() {
  // @ts-ignore
  if (genNocryToken.__cryToken) {
    // @ts-ignore
    return genNocryToken.__cryToken
  }
  const aoid = getAoid()
  const spark = new SparkMD5()
  const eluoxaeskey = localStorage.getItem('eluoxaeskey')
  spark.append(`${aoid}-bp-${eluoxaeskey}`)
  const token = spark.end(false)
  console.log('token', token)
  const result = `${aoid}-${token.length > 20 ? token.slice(0, 20) : token}`
  // @ts-ignore
  genNocryToken.__cryToken = result
  return result
}

export function getPersonInfo() {
  let personInfo = localStorage.getItem(keyMap.__getPersonal__)
  if (personInfo) {
    personInfo = JSON.parse(personInfo)
    // @ts-ignore
    return personInfo.results[0]
  } else {
    throw new Error('没有用户数据,请检查')
  }
}

export function getWebUrl() {
  return localStorage.getItem(keyMap.webUrl) || 'https://ao.space'
}



export function setUrlClientUUid(url){
    const client_uuid = Cookie.get('client_uuid')

    postMessageToIframe(`${url}/space/webrtc/loginInfo.html`, { client_uuid }).then((res) => {
      console.log(`${url} cookie client_uuid 成功`)
    })

}

/**
 * 获得盒子信息
 */
export function getBoxInfo() {
  return JSON.parse(localStorage.getItem(keyMap.boxLanInfo))
}




