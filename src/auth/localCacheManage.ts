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

import {
  FileParam,
  FileListResponseStruct,
  FileStruct,
  Category,
  CacheStruct,
  FileListMapStorageCache
} from '@/api/model'
import { debubbe, genPromise } from '@/utils/help'
import { setCacheInfo, getCacheInfo, removeCacheInfo } from '@/utils/indexdbUtil'
let timeDistance = 60 * 1000 * 2 // 120 秒
import {  queryRecyclelistRaw, getAllFileList } from '@/api/rawrequest'
import { sortFileByDir, sortFileByName, addNameTypeAndPinyin } from './fileAction/fileSort'

/**
 * 根据文件夹信息 来创建 path 和 uuid的关系
 */
export function genPath(fileInfo: FileStruct) {
  // 建立path 和 uuid的映射
  let parentPath = fileInfo.path ? fileInfo.path : '/'
  let path = parentPath + fileInfo.name + '/'
  return path
}

/**
    模拟 array的splice  当没有insertFileInfo 时,从 targetArray 中删除 uuid = deleteUUid的数据
                       当有insertFileInfo 时,从targetArray中替换掉 uuid = deleteUUid 的数据
   */
function fileArraySplice(targetArray, deleteUuid, insertFileInfo) {
  let index = targetArray.findIndex((item) => {
    return item.uuid == deleteUuid
  })
  if (index != -1) {
    if (insertFileInfo) {
      targetArray.splice(index, 1, insertFileInfo)
    } else {
      targetArray.splice(index, 1)
    }
  }
}

function findFileInArray(fileArray, uuid) {
  return fileArray.find((item) => {
    return item.uuid == uuid
  })
}

export class LocalCacheManage {
  // 是否开启本地化
  openLocalFlag: boolean

  allDirCalled = false

  //默认5分钟更新一次
  timeDistance = 60 * 1000 * 2

  columnMap = {
    name: 'pinyin',
    operation_time: 'operationAt'
  }

  /**
   * 文件夹信息 key[文件夹uuid]:value[文件信息 ... child:[]]
   */
  fileListMapStorageCache: FileListMapStorageCache

  /**
   * 缓存文件列表
   */
  storageFileList = debubbe(() => {
    let cacheStruct: CacheStruct<FileListMapStorageCache> = {
      time: new Date().getTime(),
      data: JSON.parse(JSON.stringify(this.fileListMapStorageCache))
    }
    try {
      setCacheInfo('fileListMapStorage', cacheStruct)
    } catch (error) {
      console.log(error)
    }
  }, 1500)

  /**
   * 缓存回收站文件列表
   */
  storageDeleteFileList = debubbe(() => {
    let cacheStruct: CacheStruct<FileListMapStorageCache> = {
      time: new Date().getTime(),
      data: JSON.parse(JSON.stringify(this.gobalDeleteFileListMemCache))
    }
    try {
      setCacheInfo('deleteFileListCache', cacheStruct)
    } catch (error) {
      console.log(error)
    }
  }, 1500)

  /**
   *  缓存图片 视频 文档 其他等
   */
  categoryCache = {
    picture: [],
    video: [],
    document: [],
    other: []
  }

  /**
   * 路径和uuid的映射
   */
  pathToUUidMap = Object.assign({ '/': -1 })

  /**
   * 回收站文件列表
   */
  gobalDeleteFileListMemCache = []

  constructor({ openLocalFlag }) {
    this.openLocalFlag = !!openLocalFlag
    this.fileListMapStorageCache = Object.assign({})
  }

  _resetCache() {
    this.categoryCache = {
      picture: [],
      video: [],
      document: [],
      other: []
    }
    this.pathToUUidMap = Object.assign({ '/': -1 })
  }

  clearLocalCache() {
    this.allDirCalled = false
    removeCacheInfo('fileListMapStorage')
    removeCacheInfo('deleteFileListCache')
  }
  /**
   * 本地化的起点
   */
  getAllDirStruct(fileInfo) {
    if (!localStorage.getItem('eluoxaccessToken')) {
      console.log('has not login')
      return
    }
    // 开启本地化
    if (this.openLocalFlag && !this.allDirCalled) {
      if (window.navigator.onLine) {
        // 在线才会调用接口
        this.allDirCalled = true // 被调用了,设置标志位, 防止被重复调用
        this._getDeleteFileFromCache()
        this._getFileDirStruct(fileInfo)
      }
    }
    if (this.openLocalFlag) {
      console.log('开启定时')
      setTimeout(() => {
        this.allDirCalled = false
        this.getAllDirStruct({})
      }, this.timeDistance)
    }
  }

  /**
   * 取已删除文件列表
   * 先从缓存取,缓存失效或者没有缓存 直接请求接口
   */
  async _getDeleteFileFromCache() {
    let tmpfileListMapStorageCache = await getCacheInfo('deleteFileListCache')
    let tmp = tmpfileListMapStorageCache as CacheStruct<Array<FileStruct>>
    if (tmp) {
      let time = tmp.time
      let now = new Date().getTime()
      if (now - time < timeDistance) {
        // 时间间隔小于600秒 直接取缓存
        this.gobalDeleteFileListMemCache = tmp.data
        return
      }
    }
    let res = await queryRecyclelistRaw()
    let fileList = res.results.fileList || []

    this.gobalDeleteFileListMemCache = fileList
    //通知indexdb 缓存回收站文件
    this.storageDeleteFileList()
  }

  /**
   * 取文件列表
   * 先从缓存取,缓存失效或者没有缓存 直接请求接口
   */
  async _getFileDirStruct(fileInfo) {
    let tmpfileListMapStorageCache = await getCacheInfo('fileListMapStorage')
    let tmp = tmpfileListMapStorageCache as CacheStruct<FileListMapStorageCache>
    if (tmp) {
      // 取缓存
      let time = tmp.time
      let now = new Date().getTime()
      if (now - time < timeDistance) {
        // 时间间隔小于60秒 直接取缓存
        // 重置下 category 和 pathtouuidMap
        this._resetCache()
        this.fileListMapStorageCache = tmp.data
        let values = Object.values(this.fileListMapStorageCache)
        values.forEach((item: FileStruct) => {
          item.child &&
            item.child.forEach((singleFile: FileStruct) => {
              this._pushFileIntoCategoryCache(singleFile)
              this._genPathToUUidMap(singleFile)
            })
        })
        return
      }
    }

    this._getAllFileList() // 一次性取出文件列表
  }

  /**
     一次查找全部文件列表
    */
  async _getAllFileList() {
    let res = await getAllFileList()
    this._resetCache()
    let fileList = res.results.fileList
    this.fileListMapStorageCache = {
      '-1': {
        uuid: '-1',
        category: '',
        path: '',
        size: 0,
        isDir: true,
        name: '我的空间',
        child: []
      }
    }
    this.pathToUUidMap['/'] = '-1'

    fileList &&
      fileList.forEach((element: FileStruct) => {
        if (element.trashed != 1) {
          if (element.isDir) {
            // 构建文件夹uuid 和 文件信息映射
            this.fileListMapStorageCache[element.uuid] = element
            element.child = []
          }
          this._pushFileIntoCategoryCache(element)
          this._genPathToUUidMap(element)
        }
      })
    // 给 fileListMapStorageCache 中每个元素 添加子元素
    // console.time('开始计时')
    fileList &&
      fileList.forEach((element: FileStruct) => {
        if (element.trashed != 1) {
          let path = element.path

          addNameTypeAndPinyin(element)
          let parentUUid = this.pathToUUidMap[path]
          if (this.fileListMapStorageCache[parentUUid]) {
            this.fileListMapStorageCache[parentUUid].child.push(element)
          }
        }
      })
    // console.timeEnd('开始计时')
    this.storageFileList() //在1.5秒内调用1次 超过1.5秒
  }

  /**
      向指定文件夹中添加文件
      向categoryCache 中添加文件
     */
  addFileIntoCache(parentUUid, fileInfo: FileStruct) {
    // 未开启本地化
    if (!this.openLocalFlag) {
      return
    }
    if (!parentUUid) {
      // uuid 不存在就是根目录
      parentUUid = -1
    }

    //step1 是文件夹 向 fileListMapStorageCache 中添加文件uuid 和 文件信息映射,并建立文件夹路径和其uuid的映射
    if (fileInfo.isDir) {
      this.fileListMapStorageCache[fileInfo.uuid] = fileInfo
      this._genPathToUUidMap(fileInfo)
    }
    //step2 把该文件信息添加到其父文件夹下的child中
    {
      // parentFileInfo 返回个 undefine ?
      let parentFileInfo = this.fileListMapStorageCache[parentUUid]
      if (!parentFileInfo) {
        // @ts-ignore
        this.fileListMapStorageCache[parentUUid] = { child: [] }
        parentFileInfo = this.fileListMapStorageCache[parentUUid]
      }
      let child = parentFileInfo.child || []
      if (!findFileInArray(child, fileInfo.uuid)) {
        child.unshift(fileInfo)
        parentFileInfo.child = child
      }
    }

    //step3 不是文件夹就添加到categoryCache 中
    let category = fileInfo.category
    if (!fileInfo.isDir && category) {
      if (!findFileInArray(this.categoryCache[category], fileInfo.uuid)) {
        this.categoryCache[category].unshift(fileInfo)
      }
    }
    // 刷新indexdb 缓存
    this.storageFileList()
  }

  /*
      取文件夹信息
    */
  getFloderInfo(floderUUid) {
    if (floderUUid == '') {
      floderUUid = -1
      console.log('floderUUid 为空,为根目录')
    }
    return this.fileListMapStorageCache[floderUUid]
  }
  /**
     从指定文件夹中删除文件
    */
  removeFileFromCache(parentUUid, targetFileInfo: FileStruct) {
    if (!parentUUid) {
      parentUUid = -1
    }
    let targetUUid = targetFileInfo.uuid
    //step1 如果是文件夹就清除fileListMapStorageCache 中的映射 并清除 pathtoMap 中的信息

    if (targetFileInfo.isDir) {
      delete this.fileListMapStorageCache[targetUUid]
      this._deletePathToUUidMap(targetFileInfo)
    }
    // step2 从parent 中的 child 删除改child
    {
      let parentFileInfo = this.fileListMapStorageCache[parentUUid]
      if (parentFileInfo) {
        let child = parentFileInfo.child
        if (child) {
          fileArraySplice(child, targetUUid, null)
        }
      }
    }

    // 如果不是文件从 categoryCache 中删除
    let category = targetFileInfo.category
    if (!targetFileInfo.isDir && category) {
      let categoryCache = this.categoryCache[category]
      // 从 categoryCache 删除文件
      fileArraySplice(categoryCache, targetUUid, null)
    }
    // 刷新indexdb 缓存
    this.storageFileList()
  }

  /**
   * 改文件名称
   */
  findAndRename(parentUUid, name, uuid) {
    let child = this.getChild(parentUUid, null)
    let singleFile = child.find((tmp) => {
      return tmp.uuid == uuid
    })
    singleFile.name = name
    addNameTypeAndPinyin(singleFile)
    if (singleFile.isDir && this.fileListMapStorageCache[uuid]) {
      this.fileListMapStorageCache[uuid].name = name
      addNameTypeAndPinyin(this.fileListMapStorageCache[uuid])
    }
    // 刷新indexdb 缓存
    this.storageFileList()
  }

  /**
      把文件添加到回收站,并刷新缓存
    */
  addDeleteFileIntoCache(fileInfo: FileStruct) {
    this.gobalDeleteFileListMemCache.unshift(fileInfo)
    // 刷新indexdb 缓存
    this.storageDeleteFileList()
  }

  /**
     把文件从回收站删除,并刷新缓存
    */
  removeDeleteFileFromCache(uuid) {
    fileArraySplice(this.gobalDeleteFileListMemCache, uuid, null)
    // 刷新indexdb 缓存
    this.storageDeleteFileList()
  }

  /**
   * 清空回收站
   */
  clearAllDeleteFileFromCache() {
    this.gobalDeleteFileListMemCache = []
    this.storageDeleteFileList()
  }

  /*
      替换指定文件信息
    */
  replaceChild(parentUUid, targetUUid, targetFileInfo: FileStruct, replaceFileInfo: FileStruct) {
    if (!parentUUid) {
      parentUUid = -1
    }

    //step1 从 fileListMapStorageCache 替换数据fileListMapStorageCache 中的映射 并替换 pathtoMap 中的信息
    if (replaceFileInfo.isDir) {
      delete this.fileListMapStorageCache[targetUUid]
      this.fileListMapStorageCache[replaceFileInfo.uuid] = replaceFileInfo

      this._deletePathToUUidMap(targetFileInfo)
      this._genPathToUUidMap(replaceFileInfo)
    }

    //step2 从父文件夹中替换
    {
      let parentFileInfo = this.fileListMapStorageCache[parentUUid]
      let child = parentFileInfo.child
      fileArraySplice(child, targetUUid, replaceFileInfo)
    }

    {
      // step3 如果不是文件夹 就替换掉 categoryCache 中的数据
      let category = replaceFileInfo.category
      if (!replaceFileInfo.isDir && category) {
        let categoryCache = this.categoryCache[category]
        // 替换掉 categoryCache 中的数据
        fileArraySplice(categoryCache, targetUUid, replaceFileInfo)
      }
    }
    // 刷新indexdb 缓存
    this.storageFileList()
  }

  /**
   * 向图片 视频 文档 其他中插入数据
   */
  _pushFileIntoCategoryCache(fileInfo: FileStruct) {
    if (fileInfo.category) {
      this.categoryCache[fileInfo.category] = this.categoryCache[fileInfo.category] || []
      this.categoryCache[fileInfo.category].push(fileInfo)
    }
  }

  /**
   * 建立path 和 uuid的关系映射
   */
  _genPathToUUidMap(fileInfo: FileStruct) {
    if (fileInfo.isDir) {
      let path = genPath(fileInfo)
      this.pathToUUidMap[path] = fileInfo.uuid
    }
  }

  genPathToUUidMap(path, uuid) {
    this.pathToUUidMap[path] = uuid
  }
  /**
   * 清除path 和 uuid的关系映射
   */
  _deletePathToUUidMap(fileInfo: FileStruct) {
    if (fileInfo.isDir) {
      let path = genPath(fileInfo)
      delete this.pathToUUidMap[path]
    }
  }

  getFileListFromCache(fileParam: FileParam) {
    let { res, promise } = genPromise()
    let data = []
    if (fileParam.category) {
      // 图片 视频 文档 其他    正常列表 排序列表  搜索列表(不排序)
      data = this.categoryCache[fileParam.category]
    } else {
      // 我的空间   正常列表 排序列表  搜索列表(不排序)
      let uuid = fileParam.uuid ? fileParam.uuid : -1
      data = this.getChild(uuid, null)
    }
    // 处理分页
    // todo 这里要处理文件的排序方式
    let results = this.dealData(
      data,
      fileParam.pageSize,
      fileParam.page,
      fileParam.orderBy,
      fileParam.name
    )
    let response: FileListResponseStruct = {
      code: 200,
      message: 'OK',
      requestId: '',
      results: results
    }
    res(response)
    return promise
  }

  /**
   * 获得删除文件列表
   */
  getDeleteFileListCache() {
    let { res, promise } = genPromise()
    let response: FileListResponseStruct = {
      code: 200,
      message: 'OK',
      requestId: '',
      results: { fileList: this.gobalDeleteFileListMemCache, pageInfo: null }
    }
    res(response)
    return promise
  }

  /**
   * 返回分页的文件列表数据
   * @param orderBy 排序列表
   * @param name  搜索列表
   * @param orderBy 和 name 互斥
   * 排序规则 列表 先按文件名称 或者 修改时间排序,  然后 在按照文件类型排序  是文件夹的永远在自上面
   * 搜索 搜索结果 只按照文件类型排序  文件夹放在上面
   */
  dealData(data, pageSize = 10, page = 1, orderBy, name) {
    // 正常列表 大图
    let result = []

    if (!orderBy && !name) {
      result = data
      //todo 这里需要优化
      result.sort((itemOne, itemTwo) => {
        // todo 按照时间降序 默认按修改时间降序
        return itemOne.operationAt > itemTwo.operationAt ? -1 : 1
      })
    } else if (orderBy) {
      // 排序
      let [column, sortType] = orderBy.split(' ')
      // 拷贝一份,不能修改原数组
      result = [...data]
      let columnName = this.columnMap[column]
      if (columnName === 'pinyin') {
        result = sortFileByName(result, sortType)
      } else {
        result.sort((itemOne, itemTwo) => {
          if (itemOne[columnName] > itemTwo[columnName]) {
            return sortType == 'asc' ? -1 : 1
          } else {
            return sortType == 'asc' ? 1 : -1
          }
        })
      }
      //console.log(data, 'data')
    } else if (name) {
      // 搜索
      this.recursionSearchFile(data, name, result)
    }
    result = sortFileByDir(result)
    let length = result.length

    let total = length % pageSize == 0 ? length / pageSize : Math.floor(length / pageSize) + 1
    let pageInfo = {
      page: page,
      pageSize: pageSize,
      count: length,
      total: total
    }
    if (!result || length == 0) {
      return { fileList: [], pageInfo: pageInfo }
    }

    let start = pageSize * (page - 1)
    let end = pageSize * page
    if (end > length) {
      end = length
    }
    if (start > length) {
      return { fileList: [], pageInfo: pageInfo }
    }
    result = result.slice(start, end)
    result = JSON.parse(JSON.stringify(result))
    return { fileList: result, pageInfo: pageInfo }
  }
  /**
   * @return 返回搜索数据
   * @param data 全部数据
   * @param name 关键字
   * @param result 结果
   */
  recursionSearchFile(data, name, result) {
    if (!data.length) {
      return
    }
    let tmp = []
    data.forEach((element) => {
      if (element.name.indexOf(name) > -1) {
        result.push(element)
      }
      if (element.isDir) {
        tmp = tmp.concat(element.child || [])
      }
    })
    this.recursionSearchFile(tmp, name, result)
  }

  /**
   * 根据uuid 或者 category 返回对应的数据
   */
  getChild(uuid: string | number, category: Category): Array<FileStruct> {
    if (category) {
      return this.categoryCache[category]
    } else {
      return (this.fileListMapStorageCache[uuid] && this.fileListMapStorageCache[uuid].child) || []
    }
  }

  async getJobList() {
    let jobList = await getCacheInfo('_localJobList')
    return jobList
  }

  async getFrontUUidNewUUidMap() {
    let frontUUidNewUUidMap = await getCacheInfo('_frontUUidNewUUidMap')
    return frontUUidNewUUidMap
  }

  async setJobListAndFrontUUidMap(storeJobList, frontUUidNewUUidMap) {
    setCacheInfo('_localJobList', JSON.parse(JSON.stringify(storeJobList)))
    setCacheInfo('_frontUUidNewUUidMap', JSON.parse(JSON.stringify(frontUUidNewUUidMap)))
  }
}
