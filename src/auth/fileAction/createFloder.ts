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
  FloderCreateEntityStruct,
  JobStatus,
  RealCallRequest
} from '@/api/model'
import { CommonAction } from './commonAction'
import { createdirRaw as createdRaw } from '@/api/rawrequest'
import { genPromise } from '@/utils/help'
import { addNameTypeAndPinyin } from '@/auth/fileAction/fileSort'

export class CreateFloder extends CommonAction {
  constructor(localManage) {
    super(localManage)
  }

  /*
      验证方法
    */
  verify(parentInfo: FileStruct, folderName: string) {
    let passFlag = true,
      message = ''
    let child = parentInfo.child
    if (!child || child.length == 0) {
      return { passFlag, message }
    }
    let find = child.find((item) => {
      return item.name == folderName
    })
    if (find) {
      passFlag = false
      message = `创建文件夹失败,该目录下已包含'${folderName}''`
    }
    return { passFlag, message }
  }

  /*
        发起动作
      */
  doAction(params: RealCallRequest<any, FloderCreateEntityStruct>, frontUUid: string) {
    let parentUUid = params.entity.currentDirUuid || -1
    // 得到文件夹信息
    let parentInfo = this.localManage.getFloderInfo(parentUUid)

    // 这里需要判断targetUUid 是否是本地新建还是从远程拉的
    let { resolve, promise } = genPromise()
    // 验证操作
    let { passFlag, message } = this.verify(parentInfo, params.entity.folderName)
    if (!passFlag) {
      let response = this._genFailResponse(message)
      // 通知前端页面
      this.sendFileActionResult({
        actionType: ActionType.CREATEFloder,
        uuid: frontUUid,
        response: response
      })
      resolve(response)
      return promise
    }

    if (!this.fileAction.openLocalFlag()) {
      return createdRaw(params)
    }

    // 创建文件夹信息
    let targetFileInfo: FileStruct = {
      frontUUid: frontUUid,
      uuid: frontUUid,
      name: params.entity.folderName,
      isDir: true,
      size: 0,
      category: '',
      path: parentUUid == -1 ? '/' : this.genPath(parentInfo),
      createdAt: new Date().getTime()
    }
    addNameTypeAndPinyin(targetFileInfo)
    console.log(targetFileInfo, 'targetFileInfo')
    // 把新文件夹添加到对应的目录下
    this.localManage.addFileIntoCache(parentUUid, targetFileInfo)

    // 创建任务
    let job = this.fileAction._createJob(
      targetFileInfo,
      parentUUid,
      ActionType.CREATEFloder,
      params,
      'createdirRaw',
      { parentUUid, frontUUid, oldFileInfo: targetFileInfo }
    )
    if (this._isOnline()) {
      // 创建文件夹
      this.callRequest(params, parentUUid, frontUUid, job, targetFileInfo).then((result) => {
        if (result.code == 200) {
          // 建立老uuid 和 新uuid 的关系
          let fileInfo: FileStruct = result.results
          this.fileAction.frontUUidNewUUidMap[frontUUid] = { newUUid: fileInfo.uuid, callbacks: [] }
        }
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
  async callRequest(params, parentUUid, localUUid, job, oldFileInfo) {
    let result = await createdRaw(params)
    // 根据结果更新任务队列状态
    if (result.code == 200) {
      let newFileInfo: FileStruct = result.results
      newFileInfo.frontUUid = localUUid
      addNameTypeAndPinyin(newFileInfo)
      result.results = newFileInfo
      this.frontDealData(parentUUid, localUUid, oldFileInfo, newFileInfo)
    } else {
      this.resetData(parentUUid, oldFileInfo, job)
    }
    // 通知前端页面
    this.sendFileActionResult({
      actionType: ActionType.CREATEFloder,
      uuid: localUUid,
      response: result
    })
    return Promise.resolve(result)
  }

  /*
      离线恢复时被调用
    */
  doJob(params, argAfterRequest, job) {
    let { parentUUid, frontUUid, oldFileInfo } = argAfterRequest

    params = <RealCallRequest<any, FloderCreateEntityStruct>>(<unknown>params)

    params.entity.currentDirUuid = this.fileAction.genNewUUid(params.entity.currentDirUuid)

    parentUUid = this.fileAction.genNewUUid(parentUUid)
    frontUUid = this.fileAction.genNewUUid(frontUUid)
    let result = this.callRequest(params, parentUUid, frontUUid, job, oldFileInfo)
    return result
  }

  /**
       前端处理数据,让结果成功
       更新本地缓存记录
      */
  frontDealData(parentUUid, localUUid, oldFileInfo, newFileInfo) {
    // 把老数据替换成新数据
    this.localManage.replaceChild(parentUUid, localUUid, oldFileInfo, newFileInfo)
  }
  /**
        还原数据
      */
  resetData(parentUUid, oldFileInfo, job) {
    // 删除数据
    this.localManage.removeFileFromCache(parentUUid, oldFileInfo)
    job.status = JobStatus.FAIL
  }
}
