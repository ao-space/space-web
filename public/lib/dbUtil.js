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

var dbUtil =
  dbUtil ||
  (function () {
    var _indexedDB = null
    var PREFIX = '【ServiceWorker】'
    /*************************************************************************
      打开数据库
     *************************************************************************/
    function openDataBase(databaseName, storeName) {
      return new Promise(function (resolve, reject) {
        try {
          if (!indexedDB || !indexedDB.open) {
            console.log(PREFIX + 'not support IndexedDB or no open method.')
            reject()
            return
          }
          var idbRequest = indexedDB.open(databaseName)
          if (idbRequest.readyState == 'done') {
            console.log(PREFIX + 'openDataBase done.', idbRequest.result)
            _indexedDB = idbRequest.result
            resolve(idbRequest.result)
            return
          }
          idbRequest.onerror = function (event) {
            console.log(PREFIX + 'open database: error.', event.target.error)
            reject(event.target.error)
            return
          }
          // 3. success
          idbRequest.onsuccess = function (event) {
            console.log(9898)
            var db = event.target ? event.target.result : event.result
            _indexedDB = db
            resolve(db)
          }
          idbRequest.onupgradeneeded = function (event) {
            try {
              console.log(PREFIX + 'openDatabase:upgrade start.')
              var db = event.target.result
              if (db.objectStoreNames.contains(storeName)) {
                db.deleteObjectStore(storeName)
              }
              db.createObjectStore(storeName, { keyPath: 'key' })
            } catch (e) {
              console.log(
                PREFIX +
                  'openDatabase:openDatabase onupgradeneeded JS catch e. ' +
                  e.message +
                  '\n' +
                  e.stack,
              )
              reject(e)
              return
            }
          }
        } catch (e) {
          console.log(
            PREFIX + 'openDatabase:openDatabase JS catch e. ' + e.message + '\n' + e.stack,
          )
          reject(e)
          return
        }
      })
    }

    function storeData(dbName, storeName, insertData) {
      return new Promise(function (resolve, reject) {
        var logMessage
        try {
          if (_indexedDB === null) {
            console.log(PREFIX + 'storeData:DataBase Not Opened (dbName =' + dbName + ')')
            reject()
            return
          }

          var transact = _indexedDB.transaction(storeName, 'readwrite')
          var store = transact.objectStore(storeName)
          var putRequest = store.put(insertData)

          putRequest.onsuccess = function () {
            console.log(PREFIX + 'storeData:onsuccess. (storeName=' + storeName + ') ')
            resolve()
          }

          putRequest.onerror = function (event) {
            console.log(
              PREFIX + 'storeData:onerror. (storeName=' + storeName + ') ',
              event.target.error,
            )
            reject(event.target.error)
          }
        } catch (e) {
          console.log(
            PREFIX +
              'storeData:storeData JS catch e. (storeName=' +
              storeName +
              ') ' +
              e.message +
              '\n' +
              e.stack,
          )
          return reject()
        }
      })
    }

    function setUpdateReadyFlag(flag) {
      return new Promise(function (resolve, reject) {
        var updReadyFlagData = { key: 'updateReadyFlag', value: flag }
        if (_indexedDB === null) {
          reject()
          return
        }
        storeData(_DBNAME, _STORENAME, updReadyFlagData).then(
          function (result) {
            resolve()
          },
          function (error) {
            reject(error)
          },
        )
      })
    }

    function loadData(dbName, storeName, key) {
      return new Promise(function (resolve, reject) {
        var logMessage
        try {
          if (_indexedDB === null) {
            console.log(PREFIX + 'storeData:DataBase Not Opened (dbName =' + dbName + ')')
            reject('_indexedDB is null.')
            return
          }

          var transact = _indexedDB.transaction(storeName, 'readwrite')
          var store = transact.objectStore(storeName)
          var getRequest = store.get(key)

          getRequest.onsuccess = function (event) {
            console.log(PREFIX + 'loadData:onsuccess. (storeName=' + storeName + ') ')
            resolve(event.target.result)
          }

          getRequest.onerror = function (event) {
            console.log(
              PREFIX + 'loadData:onerror. (storeName=' + storeName + ') ',
              event.target.error,
            )
            reject(event.target.error)
          }
        } catch (e) {
          console.log(
            PREFIX +
              'loadData:storeData JS catch e. (storeName=' +
              storeName +
              ') ' +
              e.message +
              '\n' +
              e.stack,
          )
          return reject(e)
        }
      })
    }

    function getUpdateReadyFlag(flag) {
      return new Promise(function (resolve, reject) {
        if (_indexedDB === null) {
          openDataBase(_DBNAME, _STORENAME, _VERSION).then(function (db) {
            _indexedDB = db
            loadData(_DBNAME, _STORENAME, 'updateReadyFlag').then(
              function (result) {
                resolve(result.value)
              },
              function (error) {
                reject(error)
              },
            )
          }, reject)
          return
        }
        loadData(_DBNAME, _STORENAME, 'updateReadyFlag').then(
          function (result) {
            resolve(result.value)
          },
          function (error) {
            reject(error)
          },
        )
      })
    }

    return {
      openDataBase: openDataBase,
      storeData: storeData,
      loadData: loadData,
    }
  })()
