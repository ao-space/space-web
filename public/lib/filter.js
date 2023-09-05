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

var FilterJS = (function () {
  let cryptojsIv = ''
  let stringEncryptKey = ''
  let nativeIv

  function setIvAndKey(iv, key, rawIv) {
    cryptojsIv = iv
    stringEncryptKey = key
    nativeIv = Utiljs.toByteArray(rawIv)
  }

  /**
   * 原生解密
   */
  function cryptoNativeDecrypt(arrayBuffer) {
    return aseDecrypt(arrayBuffer, stringEncryptKey, nativeIv)
  }

  /**
   * 第三方解密
   */
  function cryptoJSDecrypt(arrayBuffer) {
    let result

    let aesKey = CryptoJS.enc.Utf8.parse(stringEncryptKey)

    let iv = CryptoJS.enc.Hex.parse(cryptojsIv)
    const wordBuffer = Utiljs.ArrayBufferToWordArray(arrayBuffer)
    let bytes = CryptoJS.AES.decrypt({ ciphertext: wordBuffer }, aesKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    if (bytes.sigBytes < 0) {
      return Promise.resolve(arrayBuffer)
    }
    result = Utiljs.WordArrayToArrayBuffer(bytes)
    return Promise.resolve(result)
  }

  function stringToArrayBuffer(s) {
    let resolve
    let promise = new Promise(function (res, rej) {
      resolve = res
    })
    var b = new Blob([s], { type: 'text/plain' })
    var r = new FileReader()
    r.readAsArrayBuffer(b)
    r.onload = function () {
      resolve(r.result)
    }

    return promise
  }

  async function aseDecrypt(cryptData, rawkey, iv) {
    try {
      let bufferKey = await stringToArrayBuffer(rawkey)
      let key = await importKey(bufferKey, 'decrypt')

      let content = await nativeDecrypt(iv, key, cryptData)
      return content
    } catch (error) {
      console.log('error', error)
      throw error
    }
  }
  /**
   * 浏览器原生aes解密
   */
  async function nativeDecrypt(iv, key, arrayBuffer) {
    let content = await crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv,
      },
      key,
      arrayBuffer,
    )
    return content
  }

  async function importKey(bufferKey, mode) {
    let key = await crypto.subtle.importKey(
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

  function returnRangeRequest(request) {
    let url = request.url
    let headers = request.headers
    let headObj = {}
    for (var pair of headers.entries()) {
      headObj[pair[0]] = pair[1]
    }
    return fetch(url, { headers: headObj, method: request.method })
      .then((res) => {
        return new Promise((resolve, reject) => {
          res.arrayBuffer().then((buffer) => {
            let decryptArrayBuffer
            let isSafari = url.indexOf('&isSafari=true') > -1
            if (isSafari) {
              decryptArrayBuffer = cryptoNativeDecrypt
            } else {
              decryptArrayBuffer = cryptoJSDecrypt
            }
            decryptArrayBuffer(buffer).then((result) => {
              var bytes = /^bytes\=(\d+)\-$/g.exec(request.headers.get('range'))
              if (!bytes) {
                bytes = /^bytes\=(\d+)\-(\d+)$/g.exec(request.headers.get('Range'))
              }
              resolve({ arrayBuffer: result, headers: res.headers, bytes, isSafari: isSafari })
            })
          })
        })
      })
      .then(jiemiResponse)
      .catch((err) => {
        console.log('err', err)
      })
  }
  function jiemiResponse({ arrayBuffer, headers, bytes, isSafari }) {
    // 取解密之后的其实位置
    var pos = bytes[1]
    var myHeaders = new Headers()
    for (var pair of headers.entries()) {
      myHeaders.append(pair[0], pair[1])
    }
    if (!isSafari) {
      myHeaders.set('Content-Type', 'application/octet-stream')
    }
    myHeaders.set('Content-Length', arrayBuffer.byteLength)
    var fileSize = headers.get('file-size')
    var end = parseInt(pos) + arrayBuffer.byteLength - 1
    if (end >= fileSize) {
      end = fileSize - 1
    }
    myHeaders.set('Content-Range', 'bytes ' + pos + '-' + end + '/' + fileSize)
    myHeaders.set('connection', 'close')
    let response = new Response(new Blob([arrayBuffer]), {
      status: 206,
      statusText: 'Partial Content',
      headers: myHeaders,
    })
    return response
  }

  return {
    setIvAndKey: setIvAndKey,
    cryptoJSDecrypt: cryptoJSDecrypt,
    cryptoNativeDecrypt: cryptoNativeDecrypt,
    returnRangeRequest: returnRangeRequest,
  }
})()
