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

import { fromByteArray } from '../utils/base64'

export function arrayBufferToBase64(buffer) {
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength
  console.log('len', len)

  return fromByteArray(bytes)
}

//字符串转字符串ArrayBuffer
export async function rsaEncry(content, pubKey, keyType) {
  try {
    let arrayBuffer = await str2ab(content)
    console.log(arrayBuffer, 'array')
    // 公钥加密  私钥解密
    const importKey =
      keyType === 'jwk' ? importPublicKeyJWK : importPublicKeyPkcs8
    const publicKey = await importKey(pubKey)
    let data = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      arrayBuffer,
    )
    console.log(data, 'data1')
    data = arrayBufferToBase64(data)
    return data
  } catch (error) {
    console.dir(error)
  }
}

function importCommonKey(format, keyData, keyUsage, isPrivate) {
  if (format != 'jwk') {
    keyData = getRawKeyToArrayBuffer(keyData, isPrivate)
  }
  return window.crypto.subtle.importKey(
    format,
    keyData,
    {
      //   name: "RSA-PSS",//RSA-OAEP
      name: 'RSA-OAEP',
      // Consider using a 4096-bit key for systems that require long-term security
      //   modulusLength: 2048,
      //   publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: 'SHA-512',
    },
    true,
    keyUsage,
  )
}

export function getRawKey(keyData, isPrivate) {
  let begin = '-----BEGIN ' + (isPrivate ? 'PRIVATE' : 'PUBLIC') + ' KEY-----\n'
  let end = '\n-----END ' + (isPrivate ? 'PRIVATE' : 'PUBLIC') + ' KEY-----'
  keyData = keyData.replace(begin, '').replace(end, '').replace(/\\r/)
  console.log(keyData)
  return keyData
}
/**
 * 去除头尾的----public|private  key----
 * 转换成arrayBuffer
 */
export function getRawKeyToArrayBuffer(keyData, isPrivate) {
  keyData = getRawKey(keyData, isPrivate)
  const binaryDerString = window.atob(keyData)
  keyData = str2ab(binaryDerString)
  return keyData
}

/**
 * 字符串到arrayBuffer 但只能用于非汉字
 */
function str2ab(str) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

export function importPublicKeyPkcs8(keyData) {
  return importCommonKey('spki', keyData, ['encrypt'], 0)
}

export function importPrivateKeyPkcs8(keyData) {
  return importCommonKey('pkcs8', keyData, ['decrypt'], 1)
}

/**
 * 导出公钥,公钥加密
 */
export function importPublicKeyJWK(keyData) {
  return importCommonKey('jwk', keyData, ['encrypt'])
}

/**
 * 导出私钥,私钥解密
 */
export function importPrivateKeyJWK(keyData) {
  return importCommonKey('jwk', keyData, ['decrypt'])
}

export function getMessageEncoding(message) {
  const enc = new TextEncoder()
  return enc.encode(message)
}

// 临时数据仓库
let dataFullTmpMap = {}
// 拼装好的数据
let dataFullMap = {}
// 存储 data_type promise
let dataFullPromise = {}

export function appendData(content) {
  let { data_type, page_num, total_page_num, data } = content
  if (data === undefined) {
    data = ''
  }
  page_num = page_num - 1
  dataFullTmpMap[data_type] =
    dataFullTmpMap[data_type] || new Array(total_page_num)
  if (dataFullTmpMap[data_type][page_num]) {
    console.warn(
      `dataFullTmpMap[${data_type}][${page_num}]已经写过值,旧值将要被覆盖`,
    )
  }
  dataFullTmpMap[data_type][page_num] = data
  notifyDataTypePromise()
}

function notifyDataTypePromise() {
  for (let data_type in dataFullTmpMap) {
    let dataArr = dataFullTmpMap[data_type]
    if (dataArr) {
      let flag = true
      for (let i = 0; i < dataArr.length; i++) {
        let tmp = dataArr[i]
        if (tmp === undefined) {
          flag = false
          break
        }
      }
      if (flag) {
        // 值填满
        dataFullMap[data_type] = dataArr.join('')
        let data_type_promiseArr = dataFullPromise[data_type]
        if (data_type_promiseArr) {
          // 如果有data_type 对应的promise 就通知promise
          data_type_promiseArr[0](dataFullMap[data_type])
        }
      }
    }
  }
}

/**
 * params = {data_type:11}
 */
export function getDataTypeFullData(params) {
  let data_type = params.data_type
  let promise = new Promise((resolve, reject) => {
    let data = dataFullMap[data_type]
    if (data) {
      // 有数据就通知数据
      resolve(data)
    } else {
      // 无数据把resolve 和 reject先存起来
      dataFullPromise[data_type] = [resolve, reject]
    }
  })
  return promise
}
