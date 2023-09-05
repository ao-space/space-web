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

import { stringToArrayBuffer, arrayBufferToString, blobToArrayBuffer } from './stringByteUtil'

import { ArrayBufferToWordArray, WordArrayToArrayBuffer } from './help'
import { fromByteArray, toByteArray } from './base64'
import CryptoJS from 'crypto-js'
type cryType = 'native' | 'cryptojs'
type aseMode = 'encrypt' | 'decrypt'
async function importKey(bufferKey, mode: aseMode) {
  let key = await window.crypto.subtle.importKey(
    'raw',
    bufferKey,
    {
      name: 'AES-CBC',
      length: 128,
    },
    true,
    [mode],
  )
  return key
}

/**
 * 浏览器原生aes加密
 */
async function nativeEncrypt(iv, key, arrayBuffer) {
  let content = await window.crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv,
    },
    key,
    arrayBuffer,
  )
  return content
}

/**
 * 浏览器原生aes解密
 */
async function nativeDecrypt(iv, key, arrayBuffer) {
  let content = await window.crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv,
    },
    key,
    arrayBuffer,
  )
  return content
}

/**
 * aes加密
 */
export async function aseEncrypt(data, rawkey, iv) {
  try {
    let bufferKey = await stringToArrayBuffer(rawkey)
    let key = await importKey(bufferKey, 'encrypt')
    let content = await nativeEncrypt(iv, key, data)
    return content
  } catch (error) {
    throw error
  }
}

/**
 * 加密并返回字符串
 */
export async function aseEncryptToString(data: string, rawkey, iv, type: cryType): Promise<String> {
  let result = ''
  //   console.log('加密type:', type)
  if (type == 'native') {
    let arrayBuffer = await stringToArrayBuffer(data)
    let content = await aseEncrypt(arrayBuffer, rawkey, iv)
    let uint8Array = new Uint8Array(content)
    result = fromByteArray(uint8Array)
  } else if (type == 'cryptojs') {
    // 第三方库aesKey 加密
    let tmp = CryptoJS.AES.encrypt(data, rawkey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    result = CryptoJS.enc.Base64.stringify(tmp.ciphertext)
  }
  return result
}

/**
 * aes 加密文件
 */
export async function aseEncryptFile(data, rawKey, iv, type: cryType) {
  //   console.log('加密文件:', type)
  if (type == 'native') {
    return aseEncrypt(data, rawKey, iv)
  } else if (type == 'cryptojs') {
    let wordArray = ArrayBufferToWordArray(data)
    const encrypt = CryptoJS.AES.encrypt(wordArray, rawKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    return WordArrayToArrayBuffer(encrypt.ciphertext)
  }
}

/**
 * ase解密
 */
export async function aseDecrypt(cryptData: any, rawkey, iv, type: cryType): Promise<any> {
  if (!(cryptData instanceof Blob) && !(typeof cryptData == 'string')) {
    console.error('cryptData 只能为 Blob 或者 string ')
  }

  let result: any
  if (type == 'native') {
    if (cryptData instanceof Blob) {
      cryptData = await blobToArrayBuffer(cryptData)
    }
    if (typeof cryptData === 'string') {
      cryptData = toByteArray(cryptData)
    }
    let bufferKey = await stringToArrayBuffer(rawkey)
    let key = await importKey(bufferKey, 'decrypt')
    let content = await nativeDecrypt(iv, key, cryptData)
    result = new Uint8Array(content)
  } else if (type == 'cryptojs') {
    let cryDataBak = cryptData
    if (cryptData instanceof Blob) {
      let arrayBuffer = await blobToArrayBuffer(cryptData)
      const wordBuffer = ArrayBufferToWordArray(arrayBuffer)
      cryDataBak = { ciphertext: wordBuffer }
    }
    result = CryptoJS.AES.decrypt(cryDataBak, rawkey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
  }

  return result
}

/**
 * 解密返回字符串
 */
export async function aseDecryptToString(cryptData, rawkey, iv, type: cryType): Promise<string> {
  let result: any
  let value = await aseDecrypt(cryptData, rawkey, iv, type)
  if (type == 'native') {
    result = await arrayBufferToString(value)
  } else {
    result = value.toString(CryptoJS.enc.Utf8)
  }
  // console.log('解密字符串::', result, type)
  return result
}

/**
 * 解密文件
 */
export async function aseDecryptFile(cryptData, rawkey, iv, type: cryType) {
  let result: any
  // console.log('解密文件::111111', type)
  let value = await aseDecrypt(cryptData, rawkey, iv, type)
  if (type == 'native') {
    result = value
  } else {
    result = WordArrayToArrayBuffer(value)
  }
  // console.log('解密文件::', result)
  return result
}
