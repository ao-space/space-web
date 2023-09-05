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
 * 接口离线缓存包装,针对不需要参数的查询
 */
export function offLineCacheWrap(requestFn, storageCacheName) {
  if (!navigator.onLine) {
    let data = localStorage.getItem(storageCacheName)
    if (data) {
      return Promise.resolve(JSON.parse(data))
    }
  }
  let resPromise = requestFn()
  resPromise.then((data) => {
    localStorage.setItem(storageCacheName, JSON.stringify(data))
  })
  return resPromise
}
