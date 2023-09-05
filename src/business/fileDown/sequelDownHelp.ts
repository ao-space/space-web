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

import { genPromise } from '@/utils/help'
import { getCacheInfo } from '@/utils/indexdbUtil'
export interface DownRecordInfo {
  scope: {
    beginSize: number
    endSize: number
  }
  saveKey: string
  expires: number // 过期时间
}

export interface DownRecordMap {
  [key: string]: DownRecordInfo
}

export interface TaskMapPromise {
  [key: string]: Array<Promise<any>>
}

/**
 * 得到相同下载任务的前一个promise和当前promise及当前promise的resolve及reject
 */
export function getSomeBetagPrePromiseAndCurrentPromise(promiseArr) {
  let { resolve, rej, promise } = genPromise()
  let length = promiseArr.length,
    prePromise = null
  if (promiseArr.length > 0) {
    prePromise = promiseArr[length - 1]
  }
  return { prePromise, resolve, reject: rej, curPromise: promise }
}

/**
 * readyArr 中只要有 -1 就代表未全部完成
 */
export function isAllReady(readyArr) {
  return readyArr.every((item) => {
    return item != -1
  })
}

export function getAllBlobFromIndexDb(downinfo: DownRecordMap) {
  let keys = Object.keys(downinfo)
  keys.sort((a, b) => {
    if (parseInt(a) > parseInt(b)) {
      return 1
    } else {
      return -1
    }
  })
  let getBlobPromiseArr = []
  keys.forEach((key) => {
    let downRecordInfo: DownRecordInfo = downinfo[key]
    let saveKey = downRecordInfo.saveKey
    getBlobPromiseArr.push(getCacheInfo(saveKey))
  })
  return Promise.all(getBlobPromiseArr)
}

/**
 计算总进度
*/
export function countProgress(progressArray) {
  let total = 0,
    loaded = 0
  for (let i = 0; i < progressArray.length; i++) {
    let obj = progressArray[i]
    if (obj) {
      total = total + obj.total
      loaded = loaded + obj.loaded
    }
  }
  let percentWrap =
    (parseInt(<string>(<unknown>loaded) || '0') / parseInt(<string>(<unknown>total) || '100')) * 100
  let percent = Number(percentWrap).toFixed(2)
  return { total, loaded, percent }
}
