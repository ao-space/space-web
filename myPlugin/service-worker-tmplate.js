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

var cacheName = 'aolaicache-20220615'
importScripts('./lib/crypto.js')
importScripts('./lib/util.js')
importScripts('./lib/dbUtil.js')
importScripts('./lib/filter.js')
// __FILELIST__ 会被替换掉
var fileList = ['__FILELIST__']
this.addEventListener('install', function (event) {
  console.log('install')
  event.waitUntil(
    caches
      .open(cacheName)
      .then(function (cache) {
        return cache.addAll(fileList)
      })
      .then(function () {
        self.skipWaiting()
      })
  )
})

this.addEventListener('fetch', function (event) {
  var method = event.request.method
  var url = event.request.url
  if (url.indexOf('encrypted=true') > -1) {
    event.respondWith(FilterJS.returnRangeRequest(event.request))
  } else {
    // 优先走缓存,缓存没有在走网络
    if (
      method != 'POST' &&
      url.indexOf('index.html') == -1 &&
      url.indexOf('cnzz.com') == -1 &&
      method != 'XP' &&
      url.indexOf('/space/status?not307=yes') == -1
    ) {
      event.respondWith(
        caches.match(event.request).then((res) => {
          if (res) {
            return res
          }
          var requestToCache = event.request.clone()
          return fetch(requestToCache)
            .then((response) => {
              const responeseToCache = response.clone()
              caches.open(cacheName).then((cache) => {
                cache.put(requestToCache, responeseToCache)
              })
              return response
            })
            .catch((err) => {
              console.log(err)
            })
        })
      )
    }
  }
})

self.addEventListener('message', function (event) {
  let message = event.data
  if (message.type === 'aesKeyAndIv') {
    FilterJS.setIvAndKey(message.data.cryptojsIv, message.data.key, message.data.rawIv)
  }
})
