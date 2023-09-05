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
import { dbConfig } from './IndexDBConfig'

class IndexDBUtils {
  indexDB: IDBDatabase

  constructor() {
    const request = window.indexedDB.open(dbConfig.dbName, dbConfig.version)
    request.onsuccess = function () {
      // @ts-ignore
      this.indexDB = request.result as IDBDatabase // 数据库对象
      console.log('数据库打开成功')
    }
    request.onerror = function () {
      console.log('数据库打开报错')
    }
    request.onupgradeneeded = function () {
      // 数据库创建或升级的时候会触发
      console.log('更新数据库')
      const db = request.result // 数据库对象
      const storeList = dbConfig.storeList
      for (let storeConfig of storeList) {
        if (!db.objectStoreNames.contains(storeConfig.name)) {
          const store = db.createObjectStore(storeConfig.name, { keyPath: storeConfig.id })
          const indexConfigList = storeConfig.index
          if (indexConfigList) {
            for (let indexConfig of indexConfigList) {
              store.createIndex(indexConfig.indexName, indexConfig.keyName, {
                unique: indexConfig.isUnique
              })
            }
          }
        }
      }
    }
  }

  add(table: string, data: any) {
    return new Promise<void>((resolve, reject) => {
      let request = this.indexDB
        .transaction([table], 'readwrite') // 事务对象 指定表格名称和操作模式（"只读"或"读写"）
        .objectStore(table) // 仓库对象
        .add(data)

      request.onsuccess = function () {
        resolve()
      }

      request.onerror = function (event) {
        reject(event)
      }
    })
  }

  addBatch(table: string, data: []) {
    return new Promise<void>((resolve, reject) => {
      let store = this.indexDB
        .transaction([table], 'readwrite') // 事务对象 指定表格名称和操作模式（"只读"或"读写"）
        .objectStore(table) // 仓库对象

      let i = 0
      const addOne = function () {
        if (i === data.length) {
          resolve()
        }
        let request = store.add(data[i])
        request.onsuccess = function () {
          i++
          addOne()
        }
        request.onerror = function (event) {
          reject(event)
        }
      }
      addOne()
    })
  }

  get(table: string, key: any) {
    return new Promise((resolve, reject) => {
      let request = this.indexDB
        .transaction([table]) // 事务
        .objectStore(table) // 仓库对象
        .get(key)

      request.onsuccess = function () {
        resolve(request.result)
      }

      request.onerror = function (event) {
        reject(event)
      }
    })
  }

  // getList(table: string, query: any) {
  //   return new Promise((resolve, reject) => {
  //     let request = this.indexDB
  //       .transaction([table]) // 事务
  //       .objectStore(table) // 仓库对象
  //       .get(key)
  //
  //     request.onerror = function (event) {
  //       reject(event)
  //     }
  //
  //     request.onsuccess = function () {
  //       resolve(request.result)
  //     }
  //   })
  // }

  update(table: string, data: any) {
    return new Promise<void>((resolve, reject) => {
      let request = this.indexDB
        .transaction([table], 'readwrite') // 事务对象
        .objectStore(table) // 仓库对象
        .put(data)

      request.onsuccess = function () {
        resolve()
      }

      request.onerror = function (event) {
        reject(event)
      }
    })
  }

  delete(table: string, key: any) {
    return new Promise<void>((resolve, reject) => {
      let request = this.indexDB.transaction([table], 'readwrite').objectStore(table).delete(key)

      request.onsuccess = function () {
        resolve()
      }

      request.onerror = function (event) {
        reject(event)
      }
    })
  }
}
export const indexDBUtils = new IndexDBUtils()
