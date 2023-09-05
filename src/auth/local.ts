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

import { queryFilelistRaw, queryRecyclelistRaw } from '@/api/rawrequest'
import { LocalCacheManage } from './localCacheManage'
import { v4 as uuidv4 } from 'uuid'
import { offLineCacheWrap } from './offLineWrap'

import {
  QueueJobStruct,
  ActionType,
  JobStatus,
  FileParam,
  ResponseStruct,
  JobInfo,
  OldUUidNewUUidStruct,
  FileListResponseStruct,
  FileStruct
} from '@/api/model'
import { debubbe, genPromise } from '@/utils/help'
import eventBus from '@/utils/eventbus'
import { CreateFloder } from './fileAction/createFloder'
import { Rename } from './fileAction/rename'
import { Copy } from './fileAction/copy'
import { Move } from './fileAction/move'
import { Restore } from './fileAction/restore'
import { DeleteFile } from './fileAction/deleteFile'
import { Clear } from './fileAction/clear'
const openLocalFlag_tmp = sessionStorage.getItem('web_openLocalFlag') != '1'
export let localCacheManageInstance = new LocalCacheManage({ openLocalFlag: openLocalFlag_tmp })

let createFloderInstance = new CreateFloder(localCacheManageInstance)
let renameInstance = new Rename(localCacheManageInstance)
let copyInstance = new Copy(localCacheManageInstance)
let moveInstance = new Move(localCacheManageInstance)
let restoreInstance = new Restore(localCacheManageInstance)
let deleteFileInstance = new DeleteFile(localCacheManageInstance)
let clearInstance = new Clear(localCacheManageInstance)

/**
 * 文件操作类
 */
export class FileAction {
  frontUUidNewUUidMap: OldUUidNewUUidStruct // 老uuid 和 新uuid的映射
  jobList: Array<QueueJobStruct>
  localManage: LocalCacheManage //文件缓存容器
  jobDonging // 任务执行状态
  createFloder: CreateFloder
  renameInstance: Rename
  copyInstance: Copy
  moveInstance: Move
  restoreInstance: Restore
  deleteFileInstance: DeleteFile
  clearInstance: Clear
  constructor(
    localManage,
    createFloder,
    renameInstance,
    copyInstance,
    moveInstance,
    restoreInstance,
    deleteFileInstance,
    clearInstance
  ) {
    this.localManage = localManage
    this.frontUUidNewUUidMap = Object.assign({})
    this.createFloder = createFloder
    this.renameInstance = renameInstance
    this.copyInstance = copyInstance
    this.moveInstance = moveInstance
    this.restoreInstance = restoreInstance
    this.deleteFileInstance = deleteFileInstance
    this.clearInstance = clearInstance
    this.jobList = []
    this.jobDonging = false
    this._onLine = this._onLine.bind(this)
    this._emitJobChangeAndCache = debubbe(this._emitJobChangeAndCache.bind(this), 100)
    window.addEventListener('online', this._onLine)
    window.addEventListener('offline', () => {
      this.jobDonging = false
    })
    this.createFloder.setfileAction(this)
    this.renameInstance.setfileAction(this)
    this.copyInstance.setfileAction(this)
    this.moveInstance.setfileAction(this)
    this.restoreInstance.setfileAction(this)
    this.deleteFileInstance.setfileAction(this)
    this.clearInstance.setfileAction(this)
  }
  pathToUUidMap(path) {
    return this.localManage.pathToUUidMap[path]
  }

  _genFailResponse(message) {
    let response: FileListResponseStruct = {
      code: -1,
      message: message,
      requestId: '',
      results: null
    }
    return response
  }

  /**
   * 根据传进去的uuid 判断是否要被替换，在frontUUidNewUUidMap 中就替换 否则就不替换
   */
  genNewUUid(uuid) {
    if (this.frontUUidNewUUidMap[uuid]) {
      return this.frontUUidNewUUidMap[uuid].newUUid
    }
    return uuid
  }

  // todo 这里需要考虑执行状态
  async _onLine(e) {
    try {
      if (this.jobDonging) {
        return
      }
      this.jobDonging = true
      let jobList = await this.localManage.getJobList()
      let frontUUidNewUUidMap = await this.localManage.getFrontUUidNewUUidMap()
      this.jobList = <Array<QueueJobStruct>>(<unknown>jobList)
      if (frontUUidNewUUidMap) {
        this.frontUUidNewUUidMap = <OldUUidNewUUidStruct>frontUUidNewUUidMap
      }
      if (!this.jobList) {
        this.jobList = []
      }
      let jobQueue = this.jobList.map((job: QueueJobStruct, index) => {
        let fn = (preJobInfo: QueueJobStruct, preJobResult: ResponseStruct<any>) => {
          let { execInfo } = job
          let { arg: params, argAfterRequest } = execInfo
          let result
          if (job.status == JobStatus.PENGING) {
            if (job.actionType == ActionType.CREATEFloder) {
              result = this.createFloder.doJob(params, argAfterRequest, job)
            } else if (job.actionType == ActionType.MOVE) {
              result = this.moveInstance.doJob(params, argAfterRequest, job)
            } else if (job.actionType == ActionType.DELETE) {
              result = this.deleteFileInstance.doJob(params, argAfterRequest, job)
            } else if (job.actionType == ActionType.RENAME) {
              // 重命名
              result = this.renameInstance.doJob(params, argAfterRequest, job)
            } else if (job.actionType == ActionType.COPY) {
              // 复制
              result = this.copyInstance.doJob(params, argAfterRequest, job)
            } else if (job.actionType == ActionType.RESTORE) {
              //还原
              result = this.restoreInstance.doJob(params, argAfterRequest, job)
            } else if (job.actionType == ActionType.CLEAR) {
              // 清空回收站
              result = this.clearInstance.doJob(params, argAfterRequest, job)
            }
          }

          return result
        }
        return { fn, jobInfo: job }
      })
      // 找到第一个penging状态的任务
      let firstIndex = this.jobList.findIndex((job) => {
        return job.status == JobStatus.PENGING
      })
      if (firstIndex != -1) {
        this._step(
          jobQueue,
          firstIndex,
          (jobInfo: QueueJobStruct, index) => {
            // 重置  this.frontUUidNewUUidMap
            this.frontUUidNewUUidMap = Object.assign({})
            // 把当前任务及后续任务都置为失败
            for (let j = index; j < this.jobList.length; j++) {
              let jobInfoTmp: QueueJobStruct = this.jobList[j]
              jobInfoTmp.status = JobStatus.FAIL
            }
            this._emitJobChangeAndCache(this.jobList, [])
          },
          { preJobInfo: null, preJobResult: null }
        )
      }
    } catch (error) {
      console.log(error, 'error')
    }
  }

  /*
    循环调用任务队列
  */
  _step(jobQueue: Array<JobInfo>, index, failCallback, { preJobInfo, preJobResult }) {
    if (jobQueue[index]) {
      let { fn, jobInfo } = jobQueue[index]
      let result = fn(preJobInfo, preJobResult)
      if (result && result.then) {
        result.then(
          (res) => {
            if (res.code == 200) {
              // 成功就继续执行下一任务
              this.jobList[index].status = JobStatus.SUCCESS
              this._emitJobChangeAndCache(this.jobList, this.jobList.slice(index + 1))
              this._step(jobQueue, index + 1, failCallback, {
                preJobInfo: jobQueue,
                preJobResult: res
              })
            } else {
              typeof failCallback == 'function' && failCallback(jobInfo, index)
            }
          },
          (error) => {
            typeof failCallback == 'function' && failCallback(jobInfo, index)
          }
        )
      }
    } else {
      // 任务已全部执行完
      // 重置  this.frontUUidNewUUidMap
      this.frontUUidNewUUidMap = Object.assign({})
    }
  }

  /**
   更新缓存 目前给文件上传用
   把文件信息更新到 indexdb 中
   建立目录和目录信息的映射
   把文件放到对应的目录中去 (放到缓存,放到内存)
  */
  updateCache({ type, fileList, fileInfo, currentFloderInfo }) {
    let { promise, resolve } = genPromise()
    if (type == 'add') {
      let currentPath
      if (currentFloderInfo) {
        currentPath = currentFloderInfo.path + currentFloderInfo.name + '/'
      } else {
        currentPath = '/'
      }
      // 文件的路径
      let filePath = fileInfo.path
      // 当前文件路径和文件信息路径一致,代表上传到当前文件夹下
      if (currentPath == filePath) {
        // 更新fileList
        fileList.splice(0, 0, fileInfo)
        // 更新内存缓存
        this.localManage.addFileIntoCache(this.pathToUUidMap(currentPath), fileInfo)
        resolve(fileList)
      } else {
        if (
          // 当前目录下已包含该文件
          currentFloderInfo &&
          fileList.find((item) => {
            return item.uuid == currentFloderInfo.uuid
          })
        ) {
          return
        }
        // 文件不在当前页面的文件夹下
        let filePath = fileInfo.path
        // 判断文件所在的文件夹是否存在
        if (this.localManage.pathToUUidMap[filePath]) {
          // 更新内存缓存
          this.localManage.addFileIntoCache(fileInfo.parentUuid, fileInfo)
        } else {
          let pathArray = filePath.split('/')
          pathArray = pathArray.filter((item) => {
            return item != ''
          })
          let floderName = pathArray[pathArray.length - 1]
          // 不存在文件夹,创建该文件夹
          let tmpFilefloder: FileStruct = {
            uuid: fileInfo.parentUuid,
            path: filePath.slice(0, -(floderName.length + 1)), // 待定
            name: floderName,
            isDir: true,
            operationAt: new Date().getTime(),
            modifyAt: new Date().getTime(),
            betag: '',
            category: '',
            size: 0,
            parentUuid: this.pathToUUidMap(filePath.slice(0, -(floderName.length + 1)))
          }
          // 把创建的文件夹放到当前目录的缓存中
          if (this.pathToUUidMap(tmpFilefloder.path)) {
            this.localManage.addFileIntoCache(this.pathToUUidMap(tmpFilefloder.path), tmpFilefloder)
          }

          // 把当前的文件放到创建的文件下
          this.localManage.addFileIntoCache(tmpFilefloder.uuid, fileInfo)

          //从后台取文件夹信息更新
          //todo 这里存在问题 /a/b/c/d/e.txt  上传这种结构的时候 前端之后创建 /a/b 这个文件夹,其他的信息没有更新 
          //todo 修复办法 用 e.txt 的parentUUid 到 pathToUUidMap 中去找，没有就新增
          if (!this.pathToUUidMap(tmpFilefloder.path)) {
            this.localManage.genPathToUUidMap(filePath,fileInfo.parentUuid)
            return promise
          }

          // todo 这里可以重构
          queryFilelistRaw({
            uuid:
              this.pathToUUidMap(tmpFilefloder.path) == -1
                ? ''
                : this.pathToUUidMap(tmpFilefloder.path),
            name: floderName
          }).then((res) => {
            if (res.code == 200) {
              let results = res.results
              let tmpfileList = results.fileList
              let floderInfo = tmpfileList.find((item) => {
                if (item.isDir) {
                  // 计算该文件夹的全路径
                  let allPath = item.path + item.name + '/'
                  // 全路径和上面文件信息的path相等,代表找到该文件夹
                  return allPath == filePath
                }
                return false
              })
              if (floderInfo) {
                // 更新文件信息
                let tmpFile = this.localManage.getFloderInfo(floderInfo.uuid)
                let child = tmpFile.child || []
                floderInfo.child = child
                if (currentPath == floderInfo.path) {
                  this.localManage.addFileIntoCache(this.pathToUUidMap(currentPath), floderInfo)
                  fileList.splice(0, 0, floderInfo)
                }
                // 向当前页面添加该文件夹
                resolve(fileList)
              }
            }
          })
        }
      }
    }
    return promise
  }

  /**
    参考上个 updateCache 方法
     相册上传文件直接上传到根目录
   */
  updateCacheForAlbum(fileInfo) {
    console.log("updaload fileInfo",fileInfo)
    this.localManage.addFileIntoCache(fileInfo.parentUuid, fileInfo)
  }

  /**
   * 根据本地化开关决定调用函数
   *
   */
  callFnByOpenFlag(fnOne, fnTwo) {
    if (this.openLocalFlag()) {
      // 本地化打开调用这个
      if (typeof fnOne == 'function') {
        return fnOne()
      }
    } else {
      // 本地化未打开调用这个
      if (typeof fnTwo == 'function') {
        return fnTwo()
      }
    }
  }

  _isOnline() {
    // return false
    return window.navigator.onLine
  }

  _pushJobListAndNotify(job: Array<QueueJobStruct>) {
    job.forEach((item) => {
      // 给 每个job 添加位置的uuid , 方便后面区分job
      item.jobId = uuidv4()
    })
    this.jobList.push(...job)
    this._emitJobChangeAndCache(this.jobList, this.jobList)
  }

  _emitJobChangeAndCache(emitjobList, storeJobList) {
    eventBus.$emit('jobListChange', JSON.parse(JSON.stringify(emitjobList)))
    // 设置job和新老uuidmap 映射
    this.localManage.setJobListAndFrontUUidMap(storeJobList, this.frontUUidNewUUidMap)
  }

  getFileInfo(parentUUid) {
    return this.localManage.fileListMapStorageCache[parentUUid]
  }

  /**
   * 创建任务
   */
  _createJob(targetFileInfoArray, parentUUid, actionType, params, requestFnName, argAfterRequest) {
    let job: QueueJobStruct = {
      targetFileInfo: targetFileInfoArray,
      parentFileInfo: this.getFileInfo(parentUUid),
      actionType,
      createTime: new Date(),
      status: JobStatus.PENGING,
      execInfo: {
        arg: params,
        requestFnName,
        argAfterRequest
      }
    }
    return job
  }

  /**
   通用请求之后处理
  */
  _afterRequest(resolve, result, job: QueueJobStruct) {
    resolve(result)
    if (result.code != 200) {
      this._pushJobListAndNotify([job])
    }
  }

  openLocalFlag() {
    return this.localManage.openLocalFlag
  }

  /**
   查询文件夹文件列表
   */
  async queryFileList(fileParam: FileParam) {
    if (!this.openLocalFlag()) {
      return queryFilelistRaw(fileParam)
    } else {
      let res = await this.localManage.getFileListFromCache(fileParam)
      // todo 这里需要判断下该文件夹是否是新增的文件夹,但未提交到服务器
      let uuid = fileParam.uuid || -1
      let floderInfo = this.localManage.getFloderInfo(uuid)
      if (!floderInfo) {
        // 根目录信息不存在
        return queryFilelistRaw(fileParam)
      }
      //如果该文件夹未提交未同步到服务器
      if (floderInfo.uuid != floderInfo.frontUUid) {
        if (this._isOnline()) {
          // 在线就查询一下
          if (!res.results || res.results.fileList.length == 0) {
            // 当未从缓存读取,尝试从网络中取
            return queryFilelistRaw(fileParam)
          }
        }
      }

      return Promise.resolve(res)
    }
  }
  /**
   * 查询被回收站
   */
  async queryDeleteFileList() {
    if (!this.openLocalFlag()) {
      return queryRecyclelistRaw()
    } else {
      let res = await localCacheManageInstance.getDeleteFileListCache()
      if (!res.results || res.results.fileList.length == 0) {
        // 当未从缓存读取,尝试从网络中取
        return queryRecyclelistRaw()
      }
      return Promise.resolve(res)
    }
  }

  /**
   * 创建文件夹
   */
  async addNewFolder({ params, localUUid }) {
    return this.createFloder.doAction(params, localUUid)
  }

  /**
   * 移动文件夹
   */
  async moveFile({ params, targetUUid, destFileInfoArray }) {
    return this.moveInstance.doAction(params, targetUUid, destFileInfoArray)
  }

  /**
   * 请求移动文件
   */
  async _requestMoveFile({ params, destFileInfoArray, targetUUid, job }) {}
  /**
   * 删除文件
   */
  async deleteFile(params, deleteFileArray) {
    return this.deleteFileInstance.doAction(params, deleteFileArray)
  }

  /**
   * 重命名
   */
  async rename({ params, uuid, fileName, fileInfo }) {
    return this.renameInstance.doAction(params, uuid, fileName, fileInfo)
  }

  /**
    复制
   */
  async copyFile({ params, targetUUid = '-1', destFileInfoArray }) {
    return this.copyInstance.doAction(params, targetUUid, destFileInfoArray)
  }

  /**
   * 回收站还原
   */
  async restoreRecycle({ params, targetFileArr }) {
    return this.restoreInstance.doAction(params, targetFileArr)
  }

  /**
   * 清空回收站
   */
  async clearRecycle({ params, uuidArr, deleteFileArr }) {
    return this.clearInstance.doAction(params, uuidArr, deleteFileArr)
  }
  /**
   * 在线直接掉接口,离线走缓存
   */
  offLineCacheWrap(requestFn, storageCacheName) {
    return offLineCacheWrap(requestFn, storageCacheName)
  }
}

export let fileActionInstance = new FileAction(
  localCacheManageInstance,
  createFloderInstance,
  renameInstance,
  copyInstance,
  moveInstance,
  restoreInstance,
  deleteFileInstance,
  clearInstance
)
