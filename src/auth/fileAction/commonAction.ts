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

import { FileListResponseStruct, FileStruct } from '@/api/model'
import eventBus from '@/utils/eventbus'
import { FileAction } from '../local'
import { LocalCacheManage, genPath } from '../localCacheManage'

export class CommonAction {
  localManage: LocalCacheManage //文件缓存容器
  fileAction: FileAction
  constructor(localManage) {
    this.localManage = localManage
  }

  setfileAction(fileAction) {
    this.fileAction = fileAction
  }
  /*
    验证方法
  */
  verify(...any): any {
    throw new Error('请在子类实现该方法')
  }

  verifyFloderDeep(targetUUid, destFileInfoArray) {
    let targetFileInfo = this.localManage.getFloderInfo(targetUUid)
    if (targetFileInfo) {
      let path = targetFileInfo.path
      let cenji = path.split('/')
      let max = 5 - cenji.length + 1
      for (let i = 0; i < destFileInfoArray.length; i++) {
        let destFileInfo = destFileInfoArray[i]
        if (destFileInfo.isDir) {
          let tmpDetp = this._countDetp(destFileInfo.uuid, 1)
          console.log(tmpDetp, 'tmpDetp')
          if (tmpDetp > max) {
            return { passFlag: false, message: '被操作目录和目标目录加一起的层级超过5层' }
          }
        }
      }
    }
    return { passFlag: true, message: '' }
  }

  /**
   * 计算最大深度
   */
  _countDetp(uuid, currentDetp) {
    let fileInfo = this.localManage.getFloderInfo(uuid)
    if (!fileInfo) {
      return currentDetp
    }
    if (!fileInfo.isDir) {
      return currentDetp
    }
    if (!fileInfo.child) {
      return currentDetp
    }
    if (fileInfo.child.length == 0) {
      return currentDetp
    }
    let max = currentDetp
    for (let i = 0; i < fileInfo.child.length; i++) {
      let childInfo = fileInfo.child[i]
      if (childInfo.isDir) {
        let tmp = currentDetp + this._countDetp(childInfo.uuid, currentDetp)
        max = Math.max(max, tmp)
      }
    }

    return max
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
  doAction(...any): any {
    throw new Error('请在子类实现该方法')
  }

  /**
   在发起后台操作之前做动作,操作本地缓存
  */
  beforeCallRequest(...any): any {
    throw new Error('请在子类实现该方法')
  }
  /**
    向后台发起请求方法
  */
  callRequest(...any): any {
    throw new Error('请在子类实现该方法')
  }

  /**
   前端处理数据,让结果成功
  */
  frontDealData(...any): any {
    throw new Error('请在子类实现该方法')
  }
  /**
    还原数据
  */
  resetData(...any): any {
    throw new Error('请在子类实现该方法')
  }
  genPath(fileInfo: FileStruct) {
    return genPath(fileInfo)
  }

  _isOnline() {
    // return false
    return window.navigator.onLine
  }

  _genFailResponse(message) {
    let response: FileListResponseStruct = {
      code: -1,
      message: message,
      requestId: '',
      results: null,
    }
    return response
  }

  /**
   离线恢复在线时被调用
  */
  doJob(...any): any {
    throw new Error('请在子类实现该方法')
  }

  /**
   前端接受到后台返回,发送结果给页面
  */
  sendFileActionResult(result: any) {
    eventBus.$emit('acceptFileActionResult', result)
  }

  /*
    通知页面
  */
  notifyPageResult(...any): any {
    throw new Error('请在子类实现该方法')
  }
}
