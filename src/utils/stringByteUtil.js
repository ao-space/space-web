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

/**
 * string 转成 ArrayBuffer
 */
export function stringToArrayBuffer(s) {
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

/**
 * arrayBuffer 转 string
 */
export function arrayBufferToString(u) {
  let resolve
  let promise = new Promise(function (res, rej) {
    resolve = res
  })
  var b = new Blob([u])
  var r = new FileReader()
  r.readAsText(b, 'utf-8')
  r.onload = function () {
    resolve(r.result)
  }
  return promise
}

export function blobToArrayBuffer(blob) {
  let res, rej, promise
  promise = new Promise((r, j) => {
    res = r
    rej = j
  })
  var reader = new FileReader()
  reader.onload = function () {
    res(this.result)
  }
  reader.readAsArrayBuffer(blob)
  return promise
}
