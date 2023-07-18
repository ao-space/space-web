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

import { ActionType, CopyFileUUidMap, FileStruct, JobStatus } from '@/api/model'
import { CommonAction } from './commonAction'
import { copyFileRaw } from '@/api/rawrequest'
import { genPromise } from '@/utils/help'
import { v4 as uuidv4 } from 'uuid'
import i18n from '@/language/index'
export class Copy extends CommonAction {
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
      actionType: ActionType.COPY,
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
    // 这里需要判断targetUUid 是否是本地新建还是从远程拉的
    targetUUid = this.fileAction.genNewUUid(targetUUid)
    let { resolve, promise } = genPromise()
    // 验证操作
    let { passFlag, message } = this.verify(targetUUid, destFileInfoArray, ActionType.COPY)
    if (passFlag) {
      // 重名验证通过，开启层级验证
      let verifyResult = this.verifyFloderDeep(targetUUid, destFileInfoArray)
      passFlag = verifyResult.passFlag
      message = verifyResult.message
    }
    if (!passFlag) {
      let response = this._genFailResponse(message)
      // 通知前端页面
      // this.notifyPageResult(uuid, fileName, response)
      resolve(response)
      return promise
    }

    if (!this.fileAction.openLocalFlag()) {
      return copyFileRaw(params)
    }

    // 先复制一份
    destFileInfoArray = JSON.parse(JSON.stringify(destFileInfoArray))
    console.log('原复制文件信息', destFileInfoArray)
    let targetFileInfo = this.localManage.getFloderInfo(targetUUid)
    let parentPath = this.genPath(targetFileInfo)
    // 修改复制的文件信息
    destFileInfoArray.forEach((element) => {
      let uuid = element.uuid
      let frontUUid = uuidv4()
      element.uuid = frontUUid // 产生新的uuid
      element.frontUUid = frontUUid
      element.path = parentPath
      element.oldServerUUid = uuid // 把老的uuid 备份 方便后面复制返
      this.localManage.addFileIntoCache(targetUUid, element)
    })
    console.log('复制之后的文件信息', destFileInfoArray)

    let job = this.fileAction._createJob(
      destFileInfoArray,
      targetUUid,
      ActionType.COPY,
      params,
      'copyFileRaw',
      { destFileInfoArray },
    )
    this.localManage.storageFileList() //在1.5秒内调用1次 超过1.5秒
    if (this._isOnline()) {
      // 发送请求
      this.callRequest(params, destFileInfoArray, targetUUid, job).then((data) => {
        this.fileAction._afterRequest(resolve, data, job)
      })
    } else {
      this.fileAction._pushJobListAndNotify([job])
    }
    return promise
  }

  /**
      向后台发起请求方法
    */
  async callRequest(params, destFileInfoArray, targetUUid, job) {
    let data = await copyFileRaw(params)
    if (data.code != 200) {
      this.resetData(destFileInfoArray, targetUUid, job)
    } else {
      this.frontDealData(data, destFileInfoArray, targetUUid)
    }
    // 通知前端页面
    // this.notifyPageResult(uuid, fileName, result)
    return Promise.resolve(data)
  }

  /*
    离线恢复时被调用
  */
  doJob(params, argAfterRequest, job) {
    let { destFileInfoArray, targetUUid } = argAfterRequest
    targetUUid = this.fileAction.genNewUUid(targetUUid)
    params.entity.dstPath = this.fileAction.genNewUUid(params.entity.dstPath)
    //todo 这里的uuid 为数组
    params.entity.uuids = params.entity.uuids.map((element) => {
      return this.fileAction.genNewUUid(element)
    })
    let result = this.callRequest(params, destFileInfoArray, targetUUid, job)
    return result
  }

  /**
     前端处理数据,让结果成功
     更新本地缓存记录
    */
  frontDealData(data, destFileInfoArray, targetUUid) {
    let { results } = data
    let arrayData = results.Data
    console.log('datahahha', data)
    destFileInfoArray.forEach((element: FileStruct) => {
      //todo 这里需要考虑 uuid从 targetUUid 中删除
      this.localManage.removeFileFromCache(targetUUid, element)
      let tmp: CopyFileUUidMap = arrayData.find((item: CopyFileUUidMap) => {
        return item.oldId == element.oldServerUUid
      })

      if (tmp) {
        // 建立frontUUid 和 后台返回的uuid的映射
        let frontUUid = element.uuid
        this.fileAction.frontUUidNewUUidMap[frontUUid] = {
          newUUid: tmp.newId,
          callbacks: [],
        }
        // 把frontuuid 替换成服务器返回的uuid
        element.uuid = tmp.newId
      }
      this.localManage.addFileIntoCache(targetUUid, element)
    })
    console.log('data复制成功', destFileInfoArray)
  }

  /**
      还原数据
    */
  resetData(destFileInfoArray, targetUUid, job) {
    // 删除数据
    destFileInfoArray.forEach((element: FileStruct) => {
      //todo 这里需要考虑 uuid从 targetUUid 中删除
      this.localManage.removeFileFromCache(targetUUid, element)
    })
    job.status = JobStatus.FAIL
  }
}
