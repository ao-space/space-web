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

import { ActionType, FileStruct, JobStatus, QueueJobStruct } from '@/api/model'
import { CommonAction } from './commonAction'
import { restoreRecycleRaw } from '@/api/rawrequest'
import { genPromise } from '@/utils/help'

export class Restore extends CommonAction {
  constructor(localManage) {
    super(localManage)
  }

  /*
    验证方法
  */
  verify(targetFileArr) {
    let passFlag = true
    let message = ''
    for (let i = 0; i < targetFileArr.length; i++) {
      let fileInfo: FileStruct = targetFileArr[i]
      let parentUUid = this.localManage.pathToUUidMap[fileInfo.path]
      let parentInfo = this.localManage.getFloderInfo(parentUUid)
      if(parentInfo) {
        if (!parentInfo.child || parentInfo.child.length == 0) {
            return { passFlag, message }
          }
          let find = parentInfo.child.find((item) => {
            return item.name == fileInfo.name
          })
          if (find) {
            passFlag = false
            message = `还原失败,目标目录已包含${find.name}`
            break
          }
      }
    }
    return { passFlag, message }
  }

  /**
   通知前端结果
  */
  notifyPageResult(targetFileArr, response) {
    this.sendFileActionResult({
      actionType: ActionType.RESTORE,
      targetFileArr,
      response,
    })
  }
  /*
      发起动作 重命名
    */
  doAction(params, targetFileArr) {
    let { resolve, promise } = genPromise()
    // 验证操作
    // let { passFlag, message } = this.verify(targetFileArr)
    // if (!passFlag) {
    //   let response = this._genFailResponse(message)
    //   this.notifyPageResult(targetFileArr, response)
    //   resolve(response)
    //   return promise
    // }


    if (!this.fileAction.openLocalFlag()) {
      return restoreRecycleRaw(params)
    }
    // todo 这里有bug
    // let job = this.beforeCallRequest(params, targetFileArr)

    if (this._isOnline()) {
        console.log(7777)
      this.callRequest(params, targetFileArr, null).then((result) => {
        console.log(8888,result)
        // this.fileAction._afterRequest(resolve, result, null)
      })
    } else {
      this.fileAction._pushJobListAndNotify([])
    }

    return promise
  }
  /**
   创建任务及操作本地缓存
  */
  beforeCallRequest(params, targetFileArr) {
    let job: QueueJobStruct = this.fileAction._createJob(
      targetFileArr,
      this.fileAction.pathToUUidMap(targetFileArr[0].path),
      ActionType.RESTORE,
      params,
      'restoreRecycleRaw',
      {
        targetFileArr,
      },
    )
    job.toFolderInfo = targetFileArr

    targetFileArr.forEach((item: FileStruct) => {
      // step1 从全局文件中删除
      this.localManage.removeDeleteFileFromCache(item.uuid)
      let parentUUid = this.fileAction.pathToUUidMap(item.path)
      this.localManage.addFileIntoCache(parentUUid, item)
    })
    this.localManage.storageFileList() //在1.5秒内调用1次 超过1.5秒
    this.localManage.storageDeleteFileList()
    return job
  }

  /**
      向后台发起请求方法
    */
  async callRequest(params, targetFileArr, job) {
    let result = await restoreRecycleRaw(params)
  
    if (result.code !== 200 && result.code !== 201) {
      // 失败还原
      this.resetData(targetFileArr, job)
      this.notifyPageResult(targetFileArr, result)
    }
    return Promise.resolve(result)
  }

  /*
    离线恢复时被调用
  */
  doJob(params, argAfterRequest, job) {
    console.log('RESTORE')
    let { targetFileArr } = argAfterRequest
    // todo 这里的uuid 为数组
    params.entity.uuids = params.entity.uuids.map((element) => {
      return this.fileAction.genNewUUid(element)
    })
    let result = this.callRequest(params, targetFileArr, job)
    return result
  }

  /**
      还原数据
    */
  resetData(targetFileArr, job) {
    // 删除数据
    targetFileArr.forEach((item: FileStruct) => {
      // 还原到全局删除列表
      this.localManage.gobalDeleteFileListMemCache.push(item)
      // 从文件列表中删除
      let parentUUid = this.fileAction.pathToUUidMap(item.path)
      this.localManage.removeFileFromCache(parentUUid, item)
    })
    // 把job的状态置为失败
    job.status = JobStatus.FAIL
  }
}
