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

import { DownOptions } from './model'
import { v4 as uuidv4 } from 'uuid'

/**
 * 所有的下载请求都放到requestArray 中
 * count 初始化为5
 * 每开启一个下载 count 减去 1   每完成一个下载count + 1
 * 只有count 大于0是才开始下载
 */
let requestArray = []
let count = 5
export function downLoadFile(downOptions: DownOptions) {
  let uuid = uuidv4()
  downOptions.__uuid = uuid
  let promise = new Promise((res, rej) => {
    downOptions.__resolve = res
    downOptions.__reject = rej
  })

  requestArray.push(downOptions)
  next()
  return () => {
    // 返回取消函数  取消分为2种  一种从requestArray 中去掉待执行的数据  第二种是已经开始请求了,取消掉请求
    let index = requestArray.findIndex((item) => {
      return item.__uuid == uuid
    })
    if (index != -1) {
      requestArray.splice(index, 0)
      releaseCountAndNext()
    } else {
      promise.then((xhr) => {
        if (xhr) {
          ;(xhr as XMLHttpRequest).abort()
        }
      })
    }
  }
}

/**
 * 最多允许同时下载5个文件
 */
function next() {
  if (count > 0) {
    let params = requestArray.shift()
    if (params) {
      downLoadFileWrap(params)
      count--
    }
  }
}

/**
 * 加密文件
 */

function releaseCountAndNext() {
  count++
  next()
}

function downLoadFileWrap(downOptions: DownOptions) {
  const {
    success,
    fail,
    progress,
    begin,
    __resolve,
    type, // 'upload' | 'download'
    uploadParam,
    downloadParam,
    url,
    timeout,
    method
  } = downOptions
  let failWrap = (e) => {
    typeof fail == 'function' && fail(e)
  }
  let responseType = type == 'upload' ? 'json' : 'blob'
  let xhr

  xhr = new XMLHttpRequest()
  // 如果没有设置时间默认为300秒
  xhr.timeout = timeout ? timeout : 30 * 1000 * 10
  
  // 网络一中断就直接打断
  window.addEventListener('offline', () => {
    // xhr.abort()
  })
  xhr.open(method ? method : 'POST', url, true) // 也可以使用POST方式，根据接口

  xhr.responseType = responseType as XMLHttpRequestResponseType // 返回类型blob
  xhr.withCredentials = true

  if (downOptions.headers) {
    let headers = downOptions.headers
    for (let key in headers) {
      xhr.setRequestHeader(key, headers[key])
    }
  }

  // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
  xhr.onload = function () {
    // 请求完成
    releaseCountAndNext()

    // console.log(this)
    if (this.status == 200 || this.status == 206) {
      //成功下载了
      success(null, this.response)
    } else {
      failWrap(this)
    }
  }
  xhr.onprogress = function (tmp) {
    //下载
    if (type == 'download') {
      let { loaded, total } = tmp
      // console.log('hahah', loaded, downloadParam)
      if (total == 0) {
        // todo 从头部来取
        total = parseInt(this.getResponseHeader('file-size'))
      }
      let percentWrap =
        (parseInt(<string>(<unknown>loaded) || '0') / parseInt(<string>(<unknown>total) || '100')) *
        100
      let percent = Number(percentWrap).toFixed(2)
      if (typeof progress === 'function') {
        progress(percent, tmp)
      }
    }
  }
  xhr.upload.onprogress = function (tmp) {
    if (type == 'upload') {
      // 上传
      let { loaded, total } = tmp
      let percentWrap =
        (parseInt(<string>(<unknown>loaded) || '0') / parseInt(<string>(<unknown>total) || '100')) *
        100
      let percent = Number(percentWrap).toFixed(2)
      if (typeof progress === 'function') {
        progress(percent, tmp)
      }
    }
  }
  xhr.upload.onloadstart = function (tmp) {
    if (typeof begin === 'function') {
      begin()
    }
  }
  xhr.onloadstart = function (tmp) {
    // 下载
    if (typeof begin === 'function') {
      begin()
    }
  }
  xhr.onabort = function (e) {
    console.log('网络中断了,', e)
    releaseCountAndNext()
    failWrap(e)
  }
  xhr.onerror = function (e) {
    releaseCountAndNext()
    failWrap(e)
  }
  xhr.ontimeout = function (e) {
    releaseCountAndNext()
    failWrap(e)
  }
  // 发送ajax请求
  xhr.setRequestHeader('Request-Id', uuidv4())
  // todo 这里请求的参数拼装 及 md5 都应该放到外面
  if (type == 'upload') {
    xhr.send(uploadParam)
  } else {
    if (method != 'GET') {
      xhr.setRequestHeader('content-type', 'application/json')
    }
    xhr.send(downloadParam)
  }

  // 把xhr 暴露出去
  __resolve(xhr)
}

// 并发控制
