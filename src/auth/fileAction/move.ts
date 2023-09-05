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
import { moveFileRaw } from '@/api/rawrequest'
import { genPromise } from '@/utils/help'
import i18n from '@/language/index'

export class Move extends CommonAction {
  constructor(localManage) {
    super(localManage)
  }

  /*
    验证方法
  */
  verify(targetUUid, destFileInfoArray, actionType: ActionType) {
    let targetFileInfo: FileStruct = this.localManage.getFloderInfo(targetUUid)
    // 目标目录是新建的目标目录没有子文件直接返回成功
    if (!targetFileInfo || !targetFileInfo.child || targetFileInfo.child.length == 0) {
      return { passFlag: true, message: '' }
    }
    let child = targetFileInfo.child
    let passFlag = true
    let message = ''
    for (let i = 0; i < destFileInfoArray.length; i++) {
      let find = child.find((item) => {
        return item.name == destFileInfoArray[i].name
      })
      if (find) {
        if (actionType == ActionType.COPY) {
          message = i18n.global.t('space.copy_fail_contains', {name:find.name})
        } else if (actionType == ActionType.MOVE) {
          message = i18n.global.t('space.move_fail_contains', {name:find.name})
        }
        passFlag = false
        break
      }
    }
    return { passFlag, message }
  }

  /**
   通知前端结果
  */
  notifyPageResult(uuid, fileName, response) {
    this.sendFileActionResult({
      actionType: ActionType.MOVE,
      uuid: uuid,
      fileName,
      response,
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
  doAction(params, targetUUid, destFileInfoArray) {
    // 验证操作
    targetUUid = targetUUid || -1
    let { resolve, promise } = genPromise()
    // 这里需要判断targetUUid 是否是本地新建还是从远程拉的
    targetUUid = this.fileAction.genNewUUid(targetUUid)
    params.entity.destPath = targetUUid == -1 ? '' : targetUUid
    let { passFlag, message } = this.verify(targetUUid, destFileInfoArray, ActionType.MOVE)
    if (passFlag) {
      // 重名验证通过，开启层级验证
      let verifyResult = this.verifyFloderDeep(targetUUid, destFileInfoArray)
      passFlag = verifyResult.passFlag
      message = verifyResult.message
    }
    if (!passFlag) {
      let response = this._genFailResponse(message)
      resolve(response)
      return promise
    }

    if (!this.fileAction.openLocalFlag()) {
      return moveFileRaw(params)
    }
    let job = this.beforeCallRequest(destFileInfoArray, params, targetUUid)

    if (this._isOnline()) {
      // 发送请求移动文件
      this.callRequest(params, destFileInfoArray, job).then((result) => {
        this.fileAction._afterRequest(resolve, result, job)
      })
    } else {
      // 把job 放到任务队列中
      this.fileAction._pushJobListAndNotify([job])
    }
    return promise
  }

  /**
   create job and 做本地的动作
  */
  beforeCallRequest(destFileInfoArray, params, targetUUid) {
    // 创建job
    let job = this.fileAction._createJob(
      destFileInfoArray,
      this.fileAction.pathToUUidMap(destFileInfoArray[0].path),
      ActionType.MOVE,
      params,
      'moveFileRaw',
      {
        destFileInfoArray,
        targetUUid,
      },
    )
    job.toFolderInfo = this.localManage.getFloderInfo(targetUUid)
    let { path, name } = job.toFolderInfo
    let targetPath = path + name + '/'
    // 先从原目录下删除, 同时改变其path
    destFileInfoArray.forEach((element: FileStruct) => {
      let parentUUid = this.fileAction.pathToUUidMap(element.path)
      // 从当前目录下删除
      this.localManage.removeFileFromCache(parentUUid, element)
      // 改变所在目录
      element.oldPath = element.path
      element.path = targetPath
      // 添加到目标目录
      this.localManage.addFileIntoCache(targetUUid, element)
    })
    return job
  }
  /**
      向后台发起请求方法
    */
  async callRequest(params, destFileInfoArray, job) {
    let data = await moveFileRaw(params)
    if (data.code != 200) {
      this.resetData(destFileInfoArray, job)
    }
    return Promise.resolve(data)
  }

  /*
    离线恢复时被调用
  */
  doJob(params, argAfterRequest, job) {
    console.log('move')
    let { destPath, uuids: sourceUUidArray } = params.entity
    params.entity.destPath = this.fileAction.genNewUUid(destPath)
    // todo 这里的uuid 是数组
    params.entity.uuids = sourceUUidArray.map((uuid) => {
      return this.fileAction.genNewUUid(uuid)
    })
    // 发送请求移动文件
    let { destFileInfoArray, targetUUid } = argAfterRequest
    targetUUid = this.fileAction.genNewUUid(targetUUid)
    let result = this.callRequest(params, destFileInfoArray, job)
    return result
  }

  /**
      还原数据
    */
  resetData(destFileInfoArray, job) {
    // 删除数据
    destFileInfoArray.forEach((element: FileStruct) => {
      let parentUUid = this.fileAction.pathToUUidMap(element.path)
      // 从被移动的目录下删除
      this.localManage.removeFileFromCache(parentUUid, element)
      // 改变所在目录
      element.path = element.oldPath
      let oldParentUUid = this.fileAction.pathToUUidMap(element.oldPath)
      // 添加到原目录
      this.localManage.addFileIntoCache(oldParentUUid, element)
    })
    // 把job的状态置为失败
    job.status = JobStatus.FAIL
  }
}
