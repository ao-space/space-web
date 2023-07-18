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

/**
 * 直接网络请求,并进行一些网络拦截操作,比如放入到动作列表中
 */
import { post } from './network.js'
import { RealCallRequest, FileParam } from './model'
import { urlConfig } from '@/config/networkConfig'
let baseUrl = urlConfig.baseUrl

// let baseUrl = ''

/**
 * 文件列表
 */
export function queryFilelistRaw(fileParam: FileParam) {
  let params: RealCallRequest<FileParam, any> = {
    queries: fileParam,
    apiVersion: 'v1',
    apiName: 'list_folders',
    serviceName: 'eulixspace-file-service',
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}

/**
 * 回收站列表
 */
export function queryRecyclelistRaw() {
  let params: RealCallRequest<any, any> = {
    queries: {
      page: 1,
      pageSize: 100000,
    },
    apiVersion: 'v1',
    apiName: 'list_recycled',
    serviceName: 'eulixspace-file-service',
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}

/**
 * 创建文件夹
 */
export function createdirRaw(params) {
  let result = post(`${baseUrl}/space/v1/api/gateway/call`, params)
  // 更改动作列表的状态
  return result
}

/**
 * 文件删除
 */
export function deleteFileRaw(params) {
  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}

/**
 * 重命名文件
 */
export function renameFileRaw(params) {
  let result = post(`${baseUrl}/space/v1/api/gateway/call`, params)
  // 更改动作列表的状态
  return result
}

/**
 * 文件移动
 */
export function moveFileRaw(params) {
  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}

/**
 * 文件拷贝
 */
export function copyFileRaw(params) {
  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}

/**
 * 回收站还原
 */
export function restoreRecycleRaw(params) {
  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}

/**
 * 回收站删除清空
 */
export function clearRecycleRaw(params) {
  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}

/**
  获得所有文件列表
*/
export function getAllFileList() {
  let params: RealCallRequest<any, any> = {
    apiVersion: 'v1',
    apiName: 'get_changedfiles',
    serviceName: 'eulixspace-file-service',
    queries: {
      timestamp: 0,
      deviceId: '9527',
    },
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}

export let requestFnMap = {
  createdirRaw,
  deleteFileRaw,
  renameFileRaw,
  moveFileRaw,
  copyFileRaw,
  restoreRecycleRaw,
  clearRecycleRaw,
}
