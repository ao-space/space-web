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

importScripts('./lib/crypto.js')
importScripts('./lib/util.js')
importScripts('./lib/dbUtil.js')
importScripts('./lib/filter.js')
var cacheName = 'aolai123'

// step 1: 得到 iv 接 asekey 向量及秘钥
// 开始解密数据
self.addEventListener('install', function (event) {
  console.log('install')
})

self.addEventListener('fetch', function (event) {
  let url = event.request.url
  if (url.indexOf('encrypted=true') > -1) {
    event.respondWith(FilterJS.returnRangeRequest(event.request))
  }
})

self.addEventListener('message', function (event) {
  let message = event.data
  if (message.type === 'aesKeyAndIv') {
    FilterJS.setIvAndKey(message.data.cryptojsIv, message.data.key, message.data.rawIv)
  }
})
