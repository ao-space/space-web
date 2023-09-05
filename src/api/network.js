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

import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { ElMessage } from 'element-plus'
import { genPromise,isDev } from '@/utils/help'
import { clearLoginInfoAndgoSpace, getWebUrl } from '@/business/login/loginUtils'

import JSEncrypt from 'jsencrypt'
import { setLoginInfo, decryptBussisSerkey, bussAseDecrypt, genParams, getLoginInfo } from '@/auth/index'
import dayjs from 'dayjs'
import { getShowOutDialogType } from '@/business/messagePoll/messagePoll'
import eventBus from '@/utils/eventbus'
import { t } from '@/language/index'

import {
  urlConfig,
  noCryptArray,
  errorDealSelfArray,
  axiosTimeout,
  deal307Event
} from '@/config/networkConfig'
import { keyMap } from '@/utils/constant'

if(!isDev()){
    axios.defaults.withCredentials = true
}


/**
 * 设置是否允许跨域时携带cookie
 */
export function setWithCredentials(flag) {
  axios.defaults.withCredentials = flag
}

axios.defaults.timeout = axiosTimeout // 超时时间90

/**
 * 对外提供设置axios超时时间方法
 */
export function setAxiosTimeout(timeout) {
  axios.defaults.timeout = timeout
}

/**
 * refresh 接口
 */
async function refreshAccessToken(resolve) {

  let refreshToken = localStorage.getItem(keyMap.refreshToken)
  let params = { refreshToken }
  let serPubkey = localStorage.getItem(keyMap.serPubkey)
  // 截取uuid 的前16 位 作为临时秘钥
  let secret = uuidv4().replace(/\-/g, '').slice(0, 16)
  localStorage.setItem('secret', secret)
  let encryptor = new JSEncrypt({}) // 创建加密对象实例
  encryptor.setPublicKey(serPubkey) //设置公钥
  let tmpEncryptedSecret = encryptor.encrypt(secret)
  try {
    let result = await post(
      `${urlConfig.baseUrl}/space/v1/api/auth/bkey/refresh?tmpEncryptedSecret=${encodeURIComponent(
        tmpEncryptedSecret
      )}`,
      params
    )
    let [secretKey] = await Promise.all([decryptBussisSerkey(result.encryptedSecret, secret)])
    setLoginInfo(result, secretKey)
  } catch (error) {
    console.log(error)
  } finally {
    resolve()
  }
}

/**
 * refresh 接口
 */
export async function switchNetworkAndAutoLogin(refreshToken,serPubkey) {

    console.log("refreshToken",refreshToken)
    console.log("serPubkey",serPubkey)


    let params = { refreshToken }
    // 截取uuid 的前16 位 作为临时秘钥
    let secret = uuidv4().replace(/\-/g, '').slice(0, 16)
    localStorage.setItem('secret', secret)
    let encryptor = new JSEncrypt({}) // 创建加密对象实例
    encryptor.setPublicKey(serPubkey) //设置公钥
    let tmpEncryptedSecret = encryptor.encrypt(secret)
    try {
      let result = await post(
        `${urlConfig.baseUrl}/space/v1/api/auth/bkey/refresh?tmpEncryptedSecret=${encodeURIComponent(
          tmpEncryptedSecret
        )}`,
        params
      )
      console.log("result",result)
      let [secretKey] = await Promise.all([decryptBussisSerkey(result.encryptedSecret, secret)])
      setLoginInfo(result, secretKey)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
}


// 添加请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    let uuid = uuidv4()
    config.headers['Request-Id'] = uuid
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

let flag460 = false

// 添加响应拦截器
axios.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    deal307Event(response.request.responseURL,response.config)
    return response
  },
  function (error) {
    // 对响应错误做点什么
    if(error && error.response){
        deal307Event(error.response.request.responseURL,error.response.config)
    }
    return Promise.reject(error)
  }
)

function isExpireAndRefresh(url) {
  let { res, promise } = genPromise()
  if (url.indexOf('/space/v1/api/auth/bkey/refresh') > -1) {
    window.__refresh = 1 // 记录已refresh
    res()
  } else {
    try {

      let time = getLoginInfo().expiresAt
      time = time.replace('[GMT]', '')
      let date1 = dayjs(time)
      let date2 = dayjs()
      let diff = date1.diff(date2, 'm')
      if (window.__refresh) {
        // 已refresh的不在refresh
        res()
      } else {
        if (isNaN(diff)) {
          res()
        } else {
          // 有效期小于1小时 开始refresh
          if (diff > 0 && diff < 60) {
            refreshAccessToken(res)
          } else {
            res()
          }
        }
      }
    } catch (e) {
      res()
    }
  }
  return promise
}
/**
 * 通用请求部分
 */
export async function request(url, data, config, method) {
  let needCrypt = !noCryptArray.some((element) => {
    return url.indexOf(element) > -1
  })
  // 判断是否需要刷新token
  await isExpireAndRefresh(url)
  let params
  // 开启ase加密过程
  if (needCrypt) {
    params = await genParams(data)
  } else {
    params = data
  }
  if (!params) {
    params = {}
  }
  let __rawData = params.__rawData
  if (__rawData) {
    delete params.__rawData
  }
  let resolve, reject
  let promise = new Promise((rev, rej) => {
    resolve = rev
    reject = rej
  })
  let res
  try {
    if (url.indexOf('?') > 0) {
      url += '&t=' + new Date().getTime()
    } else {
      url += '?t=' + new Date().getTime()
    }

    if (method === 'post') {
      res = await axios.post(url, params, config)
    } else {
      let tmp = ''
      for (let key in params) {
        tmp = `${key}=${params[key]}&${tmp}`
      }
      url = tmp ? `${url}&${tmp}` : url
      res = await axios.get(url, config)
    }
    // 需加密
    if (needCrypt) {
      let { body, code, message, requestId } = res.data
      body = await bussAseDecrypt(body)
      let debug = localStorage.getItem('debug')
      if (__rawData && __rawData.apiName != 'download_thumbnails') {
        if (debug == '2') {
          console.log('加密之前参数:', __rawData)
          console.log('解密之后返回:', body)
          console.log('\n')
        }
      }

      if (code == 200) {
        resolve(body)
      } else {
        resolve({
          code,
          message,
          requestId
        })
      }
    } else {
      resolve(res.data)
    }
  } catch (e) {
    reject(e)
    // todo 这里需要判断错误码 GW-403 需要重新登录
    if (
      e?.response?.data?.code === 'GW-403' ||
      e?.response?.data?.code === 'GW-4015' ||
      e?.response?.data?.code === 4015
    ) {
      // 有下线通知弹框 或者注销弹框 不自动退出,让其手动点确认
      if (!getShowOutDialogType()) {
        clearLoginInfoAndgoSpace()
      }
    } else if (e.response && e.response.status == 460) {
      if (!flag460) {
        ElMessage({
          message: '登录空间失败，管理员将空间平台切换到新地址，请联系管理员重新邀请后再使用',
          type: 'error',
          duration: 4000
        })
        setTimeout(() => {
          window.location.href = getWebUrl() + '/login'
        }, 4000)
        flag460 = true
      }
    } else {
      let needErrorToast = !errorDealSelfArray.some((element) => {
        return url.indexOf(element) > -1
      })
      if (needErrorToast) {
        ElMessage.error(t('error.service_exception'))
      }
    }
  }
  return promise
}

/**
 * 需后端确定返回统一格式
 */
export async function post(url, data, config) {
  return request(url, data, config, 'post')
}

//   config = config || {}
//   config.headers = config.headers || {}
//   config.headers['Request-Id'] = uuid
export function get(url, data, config) {
  return request(url, data, config, 'get')
}

export function downLoadFile() {}