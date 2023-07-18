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
  ActionType,
  FileStruct,
  JobStatus,
} from '@/api/model'
import { CommonAction } from './commonAction'
import { deleteFileRaw } from '@/api/rawrequest'
import { genPromise } from '@/utils/help'

export class DeleteFile extends CommonAction {
  constructor(localManage) {
    super(localManage)
  }

  /**
   通知前端结果
  */
  notifyPageResult(deleteFileArray, response) {
    this.sendFileActionResult({
      actionType: ActionType.DELETE,
      response,
      targetFileArr: deleteFileArray,
    })
  }
  /*
      发起动作 重命名
      检验 通知前端
          选项1:发起请求
               通知前端
                成功改状态
                失败回退
          选项2:放到job中
                发起请求
                通知前端
                  成功改状态
                  失败回退

    */
  doAction(params, deleteFileArray) {
    if (!this.fileAction.openLocalFlag()) {
      return deleteFileRaw(params)
    }
    let { res, promise } = genPromise()
    // 创建任务
    let job = this.beforeCallRequest(deleteFileArray, params)

    if (this._isOnline()) {
      // 先给数据打上标志为 代表待删除
      this.callRequest(params, job, deleteFileArray).then((result) => {
        this.fileAction._afterRequest(res, result, job)
      })
    } else {
      this.fileAction._pushJobListAndNotify([job])
    }
    return promise
  }

  beforeCallRequest(deleteFileArray, params) {
    let stepparentUUid = this.fileAction.pathToUUidMap(deleteFileArray[0].path)
    let job = this.fileAction._createJob(
      deleteFileArray,
      stepparentUUid,
      ActionType.DELETE,
      params,
      'deleteFileRaw',
      {
        deleteFileArray,
      },
    )

    deleteFileArray.forEach((element) => {
      let item = <FileStruct>(<unknown>element)
      let { path } = item
      let parentUUid = this.fileAction.pathToUUidMap(path)
      // 从原文件夹下删除
      this.localManage.removeFileFromCache(parentUUid, item)
      // 添加到全局被删除缓存中
      this.localManage.addDeleteFileIntoCache(item)
    })
    return job
  }
  /**
      向后台发起请求方法
    */
  async callRequest(params, job, deleteFileArray) {
    let result = await deleteFileRaw(params)
    // 删除失败
    if (result.code !== 200 && result.code !== 201) {
      this.resetData(deleteFileArray, job)
      this.notifyPageResult(deleteFileArray, result)
    }
    return Promise.resolve(result)
  }

  /*
    离线恢复时被调用
  */
  doJob(params, argAfterRequest, job) {
    let { deleteFileArray } = argAfterRequest
    // 发送请求删除文件
    // todo 这里的uuid 为数组
    params.entity.uuids = params.entity.uuids.map((element) => {
      return this.fileAction.genNewUUid(element)
    })
    let result = this.callRequest(params, job, deleteFileArray)
    return result
  }

  /**
      还原数据
    */
  resetData(deleteFileArray, job) {
    deleteFileArray.forEach((element: FileStruct) => {
      let parentUUid = this.fileAction.pathToUUidMap(element.path)
      this.localManage.addFileIntoCache(parentUUid, element)
      this.localManage.removeDeleteFileFromCache(element.uuid)
    })
    job.status = JobStatus.FAIL
  }
}
