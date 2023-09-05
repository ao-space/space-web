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

import CryptoJS from 'crypto-js'
import {
  aseEncryptFile,
  aseDecryptFile,
  aseEncryptToString,
  aseDecryptToString
} from '@/utils/aseUtil'
import { genPromise, Cookie, base64ToByteArray, byteArrayToHexString } from '@/utils/help'

import { LoginInfo } from '@/api/model'
import { setCacheInfo } from '@/utils/indexdbUtil'
import { keyMap } from '@/utils/constant'
// window 原生加解密 | cryptojs 加解密
type cryType = 'native' | 'cryptojs'

let cryptojsIv = '' // 给cryptojs使用的iv
let nativeIv // window自带解密iv
let rawIv = '' // 原始iv

function genIvFromLoginInfo() {
  if (!cryptojsIv) {
    let loginInfo = getLoginInfo()
    let algorithmConfig = loginInfo.algorithmConfig
    let transportation = algorithmConfig.transportation
    let initializationVector = transportation.initializationVector
    nativeIv = base64ToByteArray(initializationVector)
    cryptojsIv = byteArrayToHexString(nativeIv)
    rawIv = initializationVector
  }
  return {
    cryptojsIv,
    nativeIv,
    rawIv: rawIv
  }
}

export function getAoidFormLoginInfo() {
  let loginInfo = getLoginInfo()
  return loginInfo && loginInfo.aoid
}

export function getAesKeyAndIv() {
  let ivInfo = genIvFromLoginInfo()
  let key = localStorage.getItem(keyMap.eluoxaeskey)
  return {
    cryptojsIv: ivInfo.cryptojsIv,
    key,
    rawIv: ivInfo.rawIv
  }
}

export function getAccessTokenAndAseKey(type: cryType) {
  let aesKey, iv, cryptojsIvtmp, nativeIv

  try {
    let tmp = genIvFromLoginInfo()
    cryptojsIvtmp = tmp.cryptojsIv
    nativeIv = tmp.nativeIv
  } catch (error) {}
  if (type === 'cryptojs') {
    aesKey = CryptoJS.enc.Utf8.parse(localStorage.getItem(keyMap.eluoxaeskey))
    iv = CryptoJS.enc.Hex.parse(cryptojsIvtmp)
  } else {
    aesKey = localStorage.getItem(keyMap.eluoxaeskey)
    iv = new Uint8Array(nativeIv)
  }
  return {
    accessToken: localStorage.getItem(keyMap.eluoxaccessToken),
    aesKey: aesKey,
    iv: iv
  }
}

function _genType() {
  let type: cryType
  if (window.crypto && window.crypto.subtle && window.crypto.subtle.importKey) {
    type = 'native'
  } else {
    type = 'cryptojs'
  }
  return type
}

/**
 * 设置登录信息 access-token refresh-token
 */
export async function setLoginInfo(loginInfo: LoginInfo, secretKey: string) {
  //设置自动登录
  let autoLoginFlag = loginInfo.autoLogin ? '1' : '0'
  localStorage.setItem(keyMap.autoLoginFlag, autoLoginFlag)
  //设置扫码时间
  let now = new Date().getTime() + ''
  localStorage.setItem(keyMap.lastScanQrCodeTime, now)
  // 设置accessToken
  localStorage.setItem(keyMap.eluoxaccessToken, loginInfo.accessToken)
  // 设置refreshToken
  localStorage.setItem(keyMap.refreshToken, loginInfo.refreshToken)
  // 设置对称秘钥
  localStorage.setItem(keyMap.eluoxaeskey, secretKey)
  //设置盒子局域网信息
  //在刷新和快速登录的接口信息里没有 box 信息
  if (loginInfo.boxLanInfo) {
    localStorage.setItem(keyMap.boxLanInfo, JSON.stringify(loginInfo.boxLanInfo))
  }

  let aseInfo = {
    eluoxaeskey: secretKey,
    iv: loginInfo.algorithmConfig.transportation.initializationVector
  }
  // 保存全部信息
  localStorage.setItem(keyMap.loginInfo, JSON.stringify(loginInfo))

  setCacheInfo('aseInfo', JSON.stringify(aseInfo))
  Cookie.set(
    'loginDomain',
    encodeURIComponent(window.location.origin + window.location.pathname),
    7,
    '.eulix.xyz'
  )
}

export function getLoginInfo() {
  return JSON.parse(localStorage.getItem(keyMap.loginInfo))
}



/**
 * 解密前后端对称秘钥
 * @param encryptedSecret 后端返回的加密的对称秘钥
 * @param secret 解密秘钥
 */

export async function decryptBussisSerkey(encryptedSecret, secret) {
  let type = _genType()
  let { iv } = getAccessTokenAndAseKey(type)
  return aseDecryptToString(encryptedSecret, secret, iv, type)
}

export async function decryptBussisSerkeyWithRandomIv(encryptedSecret, secret, algorithmConfig) {
  let tmpiv = ''
  let { initializationVector } = algorithmConfig.transportation
  initializationVector = base64ToByteArray(initializationVector)
  tmpiv = byteArrayToHexString(initializationVector)
  secret = CryptoJS.enc.Utf8.parse(secret)
  let iv = CryptoJS.enc.Hex.parse(tmpiv)
  let bytes = CryptoJS.AES.decrypt(encryptedSecret, secret, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  let data = bytes.toString(CryptoJS.enc.Utf8)
  return data
}

/**
 * 业务数据加密流程
 */
export async function bussAseEncrypt(data) {
  let type = _genType()
  let { aesKey, iv } = getAccessTokenAndAseKey(type)
  data = JSON.stringify(data)
  data = await aseEncryptToString(data, aesKey, iv, type)
  return data
}

/**
 * 业务数据解密
 */
export async function bussAseDecrypt(data) {
  let type = _genType()
  let { aesKey, iv } = getAccessTokenAndAseKey(type)
  data = await aseDecryptToString(data, aesKey, iv, type)
  try {
    data = JSON.parse(data)
  } catch (e) {}
  return data
}

/**
 *  对文件的加密
 * */
export function encyptFile({ file, name }) {
  let { res, promise } = genPromise()
  var reader = new FileReader()
  reader.onload = function (e) {
    let type: cryType = _genType()
    let { aesKey, iv } = getAccessTokenAndAseKey(type)
    aseEncryptFile(e.target.result, aesKey, iv, type).then((encrypted) => {
      let encryptedFile = new File([encrypted], 'encrypted' + name, {
        type: 'application/octet-stream',
        lastModified: new Date().getTime()
      })
      res(encryptedFile)
    })
  }
  reader.readAsArrayBuffer(file)
  return promise
}

/**
 *  对文件的解密
 *  判断是否支持原生crypto,支持用原生 否则用第三方库
 */
export async function decryptFile(blob: Blob) {
  let type: cryType = _genType()
  let { aesKey, iv } = getAccessTokenAndAseKey(type)
  return aseDecryptFile(blob, aesKey, iv, type)
}

/**
 * 产生通用请求体
 */
export async function genParams(data) {
  let { accessToken } = getAccessTokenAndAseKey('native')
  let params = {
    accessToken: accessToken,
    body: '',
    __rawData: ''
  }

  params.__rawData = data
  data = await bussAseEncrypt(data)
  params.body = data

  return params
}
