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

/*
 上传文件夹
*/
import { ActionType } from '@/api/model'
import { CommonAction } from './commonAction'
import { clearRecycleRaw } from '@/api/rawrequest'
import { genPromise } from '@/utils/help'
import eventBus from '@/utils/eventbus'

export class UploadDir extends CommonAction {
  constructor(localManage) {
    super(localManage)
  }

  /**
   通知前端结果
  */
  notifyPageResult(deleteFileArray, response) {
    this.sendFileActionResult({
      actionType: ActionType.CLEAR,
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
  doAction(params, uuidArr, deleteFileArr) {
    if (!this.fileAction.openLocalFlag()) {
      return clearRecycleRaw(params)
    }
    let { resolve, promise } = genPromise()
    // todo 这里有bug
    let job = this.beforeCallRequest(params, uuidArr)
    if (this._isOnline()) {
      this.callRequest(params).then((result) => {
        this.fileAction._afterRequest(resolve, result, job)
      })
    } else {
      this.fileAction._pushJobListAndNotify([job])
    }
    return promise
  }

  beforeCallRequest(params, deleteFileArr) {
    let parentUUid = this.fileAction.pathToUUidMap(deleteFileArr[0].path)
    let job = this.fileAction._createJob(
      deleteFileArr,
      parentUUid,
      ActionType.CLEAR,
      params,
      'clearRecycleRaw',
      {
        deleteFileArr,
      },
    )
    this.localManage.clearAllDeleteFileFromCache()
    return job
  }
  /**
      向后台发起请求方法
    */
  async callRequest(params) {
    // 清空不需要传uuid
    delete params.entity.uuids
    let result = await clearRecycleRaw(params)
    if (result.code != 200) {
      // 失败还原
      eventBus.$emit('deleteFileListCacheComplete')
    }
    return Promise.resolve(result)
  }

  /*
    离线恢复时被调用
  */
  doJob(params, argAfterRequest, job) {
    let { deleteFileArr } = argAfterRequest
    // todo 这里的uuid 为数组
    let result = this.callRequest(params)
    return result
  }
}
