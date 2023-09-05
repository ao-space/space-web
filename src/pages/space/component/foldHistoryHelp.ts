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

import { localCacheManageInstance } from '@/auth/local'
let flodHistoryKey = '__foldHistoryList__'

interface SimapleFileStruct {
  uuid: string
  parentUuid: string
  name: string
  path: string
}

/**
 * 设置访问列表
 * step1. 直接访问根目录, 重新添加访问记录
 * step2. 当前元素的父节点是访问列表的最后一个元素，把当前元素放入到访问列表
 * step3. 当前元素是访问列表中的一个元素，把当前元素之后的元素全部删除
 */
export function setFlodHistory(fileInfo: SimapleFileStruct, $route) {
  let historyList = getFlodHistory($route)
  let uuid = fileInfo.uuid
  // 点击我的空间
  if (uuid == '-1') {
    historyList = []
    localStorage.setItem(flodHistoryKey, JSON.stringify(historyList))
    return
  }
  let parentUuid = fileInfo.parentUuid

  if (parentUuid == '-1') {
    // 根目录
    historyList = [fileInfo]
  } else {
    let preFileInfo = historyList[historyList.length - 1]
    if (preFileInfo.uuid == parentUuid) {
      historyList.push(fileInfo)
    } else {
      let index = historyList.findIndex((item) => {
        return item.uuid == uuid
      })
      if (index != -1) {
        historyList = historyList.slice(0, index + 1)
      } else {
        // 其他非法情况
        historyList = [fileInfo]
      }
    }
  }

  localStorage.setItem(flodHistoryKey, JSON.stringify(historyList))
}

/**
 * 获得访问列表
 */
export function getFlodHistory($route) {
  let { path, params } = $route
  if (path == '/home/space') {
    return []
  }
  let { fileId, parentId } = params
  let historyList: any = localStorage.getItem(flodHistoryKey)
  if (historyList) {
    historyList = JSON.parse(historyList) as Array<any>
    let index = historyList.findIndex((item) => {
      return item.uuid == fileId
    })
    if (index != -1) {
      historyList = historyList.slice(0, index + 1)
    } else {
      // 给浏览器前进后退使用
      let tmp = []
      // 取当前目录信息
      const floderInfo = localCacheManageInstance.getFloderInfo(fileId)
      if (floderInfo) {
        const { child, ...other } = floderInfo
        tmp.unshift({ ...other })
      }

      // 找到父元素
      let fileInfo = localCacheManageInstance.getFloderInfo(parentId)

      while (fileInfo) {
        if (fileInfo.uuid != '-1') {
          const { child, ...other } = fileInfo
          tmp.unshift({ ...other })
        }

        if (fileInfo.path == '/') {
          break
        }
        // 向上找直到根元素
        fileInfo = localCacheManageInstance.getFloderInfo(fileInfo.parentUuid)
      }
      return tmp
    }
    return historyList
  }
  return []
}

export function getFloderInfo(index) {}
