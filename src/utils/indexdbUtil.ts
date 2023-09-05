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

import localforage from 'localforage'
import { isPromise, genPromise } from './help'

/***
 * 操作indexdb
 */

/**
 * 设置缓存
 */
export function setCacheInfo(key, data) {
  return localforage.setItem(key, data)
}

export function getCacheInfo(key) {
  return localforage.getItem(key)
}

export function removeCacheInfo(key) {
  return localforage.removeItem(key)
}
/**
 * 缓存原文件
 */
export function setOriginFileCache(uuid: string, blob: Blob) {
  localforage.setItem(uuid + '_origin', blob)
}

/**
 * 取原文件
 */
export function getOriginFileCache(uuid: string): Promise<Blob> {
  return localforage.getItem(uuid + '_origin')
}

/**
 * 删除原文件
 */
export function deleteOriginFileCache(uuid: string) {
  localforage.removeItem(uuid + '_origin')
}

/**
 * 缓存压缩图
 */
export function setYasuoImgCache(uuid: string, blob: Blob) {
  localforage.setItem(uuid + '_yasuo', blob)
}

/**
 * 取压缩图缓存
 */
export function getYasuoImgCache(uuid: string): Promise<Blob> {
  return localforage.getItem(uuid + '_yasuo')
}

/**
 * 清理压缩图缓存
 */
export function deleteYasuoImgCache(uuid: string) {
  localforage.removeItem(uuid + '_yasuo')
}

/**
 * 缓存缩略图
 */
export function setSuolueImgCache(uuid: string, blob: Blob) {
  localforage.setItem(uuid + '_suolue', blob)
}

/**
 * 取缩略图缓存
 */
export function getSuolueImgCache(uuid: string): Promise<Blob> {
  return localforage.getItem(uuid + '_suolue')
}

/**
 * 清理缩略图缓存
 */
export function deleteSuolueImgCache(uuid: string) {
  localforage.removeItem(uuid + '_suolue')
}

/**
 * 清理文件缓存
 */
export function clearCacheByuuid(uuid: string) {
  // 清理原文件
  deleteOriginFileCache(uuid)
  // 清理压缩图
  deleteYasuoImgCache(uuid)
  // 清理缩略图
  deleteSuolueImgCache(uuid)
}

/**
 * @param key => 存储在indexdb中的key
 * @param fn => 需要缓存结果的函数
 * @param expireTime => 缓存过期时间
 */
export function cacheNetWorkResultInIndexDb(key: string, fn: Function, expireTime: number) {
  let fnResult: any
  const { promise, resolve } = genPromise()
  return (...args) => {
    if (fnResult) {
      return fnResult
    } else {
      const result = getCacheInfo(key)
      result.then((saveData) => {
        let hasData = true
        if (saveData) {
          // @ts-ignore
          const { data, time } = saveData
          if (new Date().getTime() - time <= expireTime) {
            fnResult = Promise.resolve(data)
            resolve(data)
          } else {
            hasData = false
          }
        } else {
          hasData = false
        }
        if (!hasData) {
          fnResult = fn(...args)
          if (isPromise(fnResult)) {
            fnResult.then((res) => {
              resolve(res)
              setCacheInfo(key, {
                data: res,
                time: new Date().getTime(),
                promiseFlag: true
              })
            })
          } else {
            throw new Error('该函数只缓存fn执行结果为promise的函数结果')
          }
        }
      })
    }
    return promise
  }
}
