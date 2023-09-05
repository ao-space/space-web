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

import { ActionType, FileStruct, JobStatus } from '@/api/model'
import { CommonAction } from './commonAction'
import { renameFileRaw } from '@/api/rawrequest'
import { genPromise } from '@/utils/help'

export class Rename extends CommonAction {
  constructor(localManage) {
    super(localManage)
  }

  /*
    验证方法
  */
  verify(parentInfo: FileStruct, folderName: string) {
    let passFlag = true,
    message = ''
    if(!parentInfo){
        return { passFlag, message }
    }
    let child = parentInfo.child
    if (!child || child.length == 0) {
      return { passFlag, message }
    }
    let find = child.find((item) => {
      return item.name == folderName
    })
    if (find) {
      passFlag = false
      message = `重命名失败,已有${folderName}的文件`
    }
    return { passFlag, message }
  }

  /**
   通知前端结果
  */
  notifyPageResult(uuid, oldName, response) {
    this.sendFileActionResult({
      actionType: ActionType.RENAME,
      uuid: uuid,
      oldName: oldName,
      response,
    })
  }
  /*
      发起动作 重命名
    */
  doAction(params, uuid, fileName, fileInfo) {
    let oldName = fileInfo.oldName
    let { resolve, promise } = genPromise()
    let parentUUid = this.localManage.pathToUUidMap[fileInfo.path] || -1
    let parentInfo = this.localManage.getFloderInfo(parentUUid)
    // 验证操作
    let { passFlag, message } = this.verify(parentInfo, params.entity.folderName)
    if (!passFlag) {
      let response = this._genFailResponse(message)
      // 通知前端页面
      this.notifyPageResult(uuid, oldName, response)
      resolve(response)
      return promise
    }
    if (!this.fileAction.openLocalFlag()) {
      return renameFileRaw(params)
    }

    // 改名字

    this.localManage.findAndRename(parentUUid, fileName, uuid)

    let job = this.fileAction._createJob(
      JSON.parse(JSON.stringify(fileInfo)),
      parentUUid,
      ActionType.RENAME,
      params,
      'renameFileRaw',
      {
        fileName: oldName,
        uuid,
        parentUUid,
      },
    )
    if (this._isOnline()) {
      this.callRequest(params, parentUUid, job, oldName, uuid).then((result) => {
        console.log('result', result)
        this.fileAction._afterRequest(resolve, result, job)
      })
    } else {
      this.fileAction._pushJobListAndNotify([job])
    }

    return promise
  }

  /**
      向后台发起请求方法
    */
  async callRequest(params, parentUUid, job, oldName, uuid) {
    let result = await renameFileRaw(params)
    console.log(result, 'result')
    if (result.code != 200) {
      // 失败还原名字
      this.resetData(parentUUid, oldName, uuid, job)
    }
    // 通知前端页面
    console.log(oldName, 'fileName')
    this.notifyPageResult(uuid, oldName, result)
    return Promise.resolve(result)
  }

  /*
    离线恢复时被调用
  */
  doJob(params, argAfterRequest, job) {
    let { fileName, uuid, parentUUid } = argAfterRequest
    uuid = this.fileAction.genNewUUid(uuid)
    parentUUid = this.fileAction.genNewUUid(parentUUid)
    params.entity.uuid = this.fileAction.genNewUUid(params.entity.uuid)
    let result = this.callRequest(params, parentUUid, job, fileName, uuid)
    return result
  }

  /**
      还原数据
    */
  resetData(parentUUid, oldName, uuid, job) {
    // 删除数据
    this.localManage.findAndRename(parentUUid, oldName, uuid)
    job.status = JobStatus.FAIL
  }
}
