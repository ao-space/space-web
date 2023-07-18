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

import { getAesKeyAndIv } from '@/auth/index'

export function sendMessageToServiceWorker(message) {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage(message)
    navigator.serviceWorker.ready.then((registration) => {
      console.log(registration)
      registration.active && registration.active.postMessage(message)
    })
  }
}

export function sendAesKeyAndIvToServiceWorker(aesKeyAndIv) {
  if(!aesKeyAndIv){
    aesKeyAndIv = getAesKeyAndIv()
  }
  sendMessageToServiceWorker({
    type: 'aesKeyAndIv',
    data: {
      cryptojsIv: aesKeyAndIv.cryptojsIv,
      key: aesKeyAndIv.key,
      rawIv: aesKeyAndIv.rawIv,
    },
  })
}

