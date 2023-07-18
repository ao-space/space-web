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

import { genPromise, isDev } from './help'
/**
 * 通过iframe 加载指定的url, 并向其postmessage 等待其响应
 */
export function postMessageToIframe(url: string, params: any) {
  const { reject, promise, resolve } = genPromise()
  const testIframe = document.createElement('iframe') as HTMLIFrameElement
  if (!url || !url.startsWith('http')) {
    return Promise.reject('url 必须以http 开头')
  }
  testIframe.src = url
  testIframe.style.cssText = 'width: 0px; height: 0px'
  document.body.appendChild(testIframe)
  let postOrigin = new URL(url).origin

  console.log('postOrigin:', postOrigin)
  testIframe.onload = () => {
    setTimeout(() => {
      testIframe.contentWindow?.postMessage(params, postOrigin)
    }, 1000)
  }
  testIframe.onerror = (e) => {
    reject(e)
  }
  function dealMessage(event: MessageEvent<any>) {
    if (document.body.contains(testIframe)) {
      document.body.removeChild(testIframe)
    }
    if (event.data) {
      resolve(event.data)
    }
    window.removeEventListener('message', dealMessage, false)
  }
  window.addEventListener(
    'message',
    (event) => {
      if (!isDev() && event.origin !== postOrigin) {
        // Compliant
        return
      }
      dealMessage(event)
    },
    false
  )

  return promise
}
