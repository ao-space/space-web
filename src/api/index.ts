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

import { get, post } from './network.js'

import {
  RealCallRequest,
  FileParam,
  FileDeleteParam,
  UpLoadCreate,
} from './model'
import { genParams, getAccessTokenAndAseKey } from '@/auth/index'
import { encyptFile, decryptFile } from '@/auth/index'
import { urlConfig } from '@/config/networkConfig'
let baseUrl = urlConfig.baseUrl
import { fileActionInstance } from '@/auth/local'
import axios from 'axios'
import JSZip from 'jszip'
import networkListener from '@/album/NetworkListener'
/**
 * 查询盒子状态
 */
export function getBoxStatus() {
  return get(`${baseUrl}/space/status`)
}

/**
 * 创建access-token
 */
export function authTokenCreate(data) {
  return post(`${baseUrl}/space/v1/api/gateway/auth/token/create`, data)
}

/**
 * 授权登录
 */
export function bKeyVerify(params) {
  return post(`${baseUrl}/space/v1/api/auth/bkey/verify`, params)
}

/**
 * 自动登录
 */
export function autoLogin(params) {
  return post(`${baseUrl}/space/v1/api/auth/auto/login`, params)
}

/**
 * 轮询拉取登录状态
 */
export function pollLogin(params) {
  return post(`${baseUrl}/space/v1/api/auth/auto/login/poll`, params)
}

export function gatewayCall(data) {
  return post(`${baseUrl}/space/v1/api/gateway/call`, data)
}

export function getPublickKey() {
  return get(`${baseUrl}/space/box/publicKey.pem`)
}

/**
 * 文件列表
 */
export function queryFilelist(fileParam: FileParam) {
  let result

  result = fileActionInstance.queryFileList(fileParam)

  return result
}

/**
 * 文件删除
 */
export function deleteFile(uuidArr: FileDeleteParam, deleteFileArray) {
  let params: RealCallRequest<any, any> = {
    entity: {
      // 对应后台body
      uuids: uuidArr
    },
    // ,
    apiVersion: 'v1',
    apiName: 'delete_file',
    serviceName: 'eulixspace-file-service'
  }
  return fileActionInstance.deleteFile(params, deleteFileArray)
}

/**
 * 文件删除进度
 */
export function taskPercentage(taskId:string) {
    let params: RealCallRequest<any, any> = {
      apiVersion: '0.3.0',
      apiName: 'async_task_info',
      serviceName: 'eulixspace-file-service',
      queries: {
        taskId
      }
    }
    return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}

/**
 * 文件复制
 */
export function copyFile(targetUUid: string, sourceUUidArray, destFileInfoArray) {
  let params: RealCallRequest<any, any> = {
    entity: {
      dstPath: targetUUid,
      // 对应后台body
      uuids: sourceUUidArray
    },
    // ,
    apiVersion: 'v1',
    apiName: 'copy_file',
    serviceName: 'eulixspace-file-service'
  }
  return fileActionInstance.copyFile({ params, targetUUid, destFileInfoArray })
}

/**
 * 文件移动
 */
export function moveFile(targetUUid: string, sourceUUidArray, destFileInfoArray) {
  let params: RealCallRequest<any, any> = {
    entity: {
      destPath: targetUUid,
      // 对应后台body
      uuids: sourceUUidArray
    },
    // ,
    apiVersion: 'v1',
    apiName: 'move_file',
    serviceName: 'eulixspace-file-service'
  }
  return fileActionInstance.moveFile({ params, targetUUid, destFileInfoArray })
}

/**
 * 重命名文件夹
 */
export function renameFile(uuid, fileName, fileInfo) {
  let params: RealCallRequest<any, any> = {
    entity: {
      uuid: uuid,
      // 对应后台body
      fileName: fileName
    },
    // ,
    apiVersion: 'v1',
    apiName: 'modify_file',
    serviceName: 'eulixspace-file-service'
  }
  return fileActionInstance.rename({ params, uuid, fileName, fileInfo })
}

/**
 * 创建文件夹
 */
export function createdir({ currentDirUuid, folderName, localUUid }) {
  let params = {
    entity: {
      currentDirUuid: currentDirUuid,
      // 对应后台body
      folderName: folderName
    },
    apiVersion: 'v1',
    apiName: 'create_folder',
    serviceName: 'eulixspace-file-service'
  }
  let result = fileActionInstance.addNewFolder({ params, localUUid })
  return result
}

/**
  上传任务创建
*/
export async function upLoadCreate(paramsUpCreate: UpLoadCreate) {
  let params: RealCallRequest<any, any> = {
    apiVersion: 'v1',
    apiName: 'multipart_create',
    serviceName: 'eulixspace-file-service',
    entity: paramsUpCreate
  }
  return post(`${urlConfig.baseUrl}/space/v1/api/gateway/call`, params)
}

/*
 查询已经上传的分片
*/
export async function uploadedList(uploadId: string) {
  let params = {
    apiVersion: 'v1',
    apiName: 'multipart_list',
    queries: {
      uploadId
    },
    serviceName: 'eulixspace-file-service'
  }
  return post(`${urlConfig.baseUrl}/space/v1/api/gateway/call`, params)
}

/**
 断点续传合并
*/
export async function upLoadComplete(uploadId: string) {
  let params: RealCallRequest<any, any> = {
    apiVersion: 'v1',
    apiName: 'multipart_complete',
    serviceName: 'eulixspace-file-service',
    entity: {
      uploadId
    }
  }
  return post(`${urlConfig.baseUrl}/space/v1/api/gateway/call`, params)
}

/**
 * 回收站列表
 */

export async function queryRecyclelist() {
  let result

    let params: RealCallRequest<any, any> = {
      apiVersion: 'v1',
      apiName: 'list_recycled',
      serviceName: 'eulixspace-file-service'
    }
    result = post(`${baseUrl}/space/v1/api/gateway/call`, params)

  return result
}
/**
 * 回收站还原
 */

export function restoreRecycle(uuids, targetFileArr) {
  let params: RealCallRequest<any, any> = {
    apiVersion: 'v1',
    apiName: 'restore_recycled',
    serviceName: 'eulixspace-file-service',
    entity: {
      uuids: uuids
    }
  }

  const result = post(`${baseUrl}/space/v1/api/gateway/call`, params)
  return result
}

/**
 * 回收站删除清空
 */

export function clearRecycle(uuidArr, deleteFileArr) {
  let params: RealCallRequest<any, any> = {
    apiVersion: 'v1',
    apiName: 'clear_recycled',
    serviceName: 'eulixspace-file-service',
    entity: {
      uuids: uuidArr
    }
  }
  return fileActionInstance.clearRecycle({ params, uuidArr, deleteFileArr })
}

/**
 * get search information
 */
export function getSearch(searchFileParam: FileParam) {
  let result
  // todo 这里需要优化
  let params: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'search_files',
    serviceName: 'eulixspace-file-service',
    queries: searchFileParam
  }

  result = post(`${baseUrl}/space/v1/api/gateway/call`, params)
  return result
}

/**
 * get storage information
 */

export function getStorage() {
  let params: RealCallRequest<any, any> = {
    apiVersion: 'v1',
    apiName: 'storageinfo_show',
    serviceName: 'eulixspace-account-service',
    headers: {
      clientUUID: 'clientUUID'
    }
  }
  // 在线时直接调用接口, 离线时从缓存取
  return fileActionInstance.offLineCacheWrap(() => {
    return post(`${baseUrl}/space/v1/api/gateway/call`, params)
  }, '__getStorage__')
}

/**
 * 获取成员信息
 */
export function getMemberList() {
  let request: RealCallRequest<FileParam, any> = {
    apiVersion: '0.3.0',
    apiName: 'member_list',
    serviceName: 'eulixspace-account-service'
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 获取设备信息
 */
export function getMemberUsedStorage(aoId) {
  let params = {
    aoid: aoId
  }

  let request: RealCallRequest<any, any> = {
    apiVersion: '0.3.0',
    apiName: 'member_used_storage',
    serviceName: 'eulixspace-account-service',
    queries: params
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 获取设备信息
 */
export function getDeviceVersion() {
  let request: RealCallRequest<FileParam, any> = {
    apiVersion: '0.3.0',
    apiName: 'device_version',
    serviceName: 'eulixspace-agent-service'
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * get personal information
 */
export function getPersonal() {
  let params: RealCallRequest<any, any> = {
    apiVersion: 'v1',
    apiName: 'personalinfo_show',
    serviceName: 'eulixspace-account-service',
    headers: {
      clientUUID: 'clientUUID'
    }
  }
  // 在线时直接调用接口, 离线时从缓存取
  return fileActionInstance.offLineCacheWrap(() => {
    return post(`${baseUrl}/space/v1/api/gateway/call`, params)
  }, '__getPersonal__')
}

/**
 * update personal information
 */
export function postPersonal(personalName, personalSign) {
  let params: RealCallRequest<any, any> = {
    apiVersion: 'v1',
    apiName: 'personalinfo_update',
    serviceName: 'eulixspace-account-service',
    headers: {
      clientUUID: 'clientUUID'
    },
    entity: {
      personalName: personalName,
      personalSign: personalSign
    }
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}



/**
 * get img information
 * 获取头像
 */
export async function getImage(aoId) {
  let params: RealCallRequest<any, any> = {
    apiVersion: 'v1',
    apiName: 'image_show',
    responseType: 'blob',
    serviceName: 'eulixspace-account-service',
    queries: {}
  }
  if (aoId) {
    params.queries.aoid = aoId
  }
  let result = await genParams(params)

  return new Promise((resolve) => {
    axios({
      method: 'post',
      headers: {
        contentType: 'application/json'
      },
      url: `${baseUrl}/space/v1/api/gateway/download`,
      responseType: 'blob',
      data: result
    })
      .then(function (data) {
        return decryptFile(data.data)
      })
      .then((data) => {
        let blob = new Blob([data], { type: ' image/png' })
        resolve(blob)
      })
  })
}

/**
 * 获取设备信息
 */
export function checkVideoM3u8(uuid) {
  let params: RealCallRequest<any, any> = {
    apiVersion: '0.3.0',
    apiName: 'check',
    serviceName: 'aospace-media-vod-service',
    queries: {
      uuid: uuid
    }
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}

export async function getVideoM3u8(uuid) {
  let params: RealCallRequest<any, any> = {
    apiVersion: '0.3.0',
    apiName: 'm3u8_file',
    serviceName: 'aospace-media-vod-service',
    responseType: 'blob',
    queries: {
      uuid: uuid
    }
  }
  let result = await genParams(params)

  return new Promise((resolve) => {
    axios({
      method: 'post',
      headers: {
        contentType: 'application/json'
      },
      url: `${baseUrl}/space/v1/api/gateway/download`,
      responseType: 'blob',
      data: result
    })
      .then(function (data) {
        return decryptFile(data.data)
      })
      .then((data) => {
        let blob = new Blob([data])
        new JSZip().loadAsync(blob).then(function (zip) {
          let fileName = 'index-wan.m3u8'
          if (networkListener.isIp()) {
            fileName = 'index-lan.m3u8'
          }
          zip
            .file(fileName)
            .async('string')
            .then((file) => {
              resolve(file)
            })
        })
      })
  })
}

/**
 * post img information
 */
export async function postImg(file: Blob) {
  let params: RealCallRequest<any, any> = {
    apiVersion: 'v1',
    apiName: 'image_update',
    serviceName: 'eulixspace-account-service',
    entity: {
      mediaType: 'application/octet-stream'
    }
  }
  let result = await genParams(params)
  let formData = new FormData()
  formData.append(
    'callRequest',
    new Blob([JSON.stringify(result)], {
      type: 'application/json'
    })
  )
  let encryptedFile = await encyptFile({ file: file, name: 'name' })
  formData.append('file', encryptedFile)

  return new Promise((resolve) => {
    axios({
      method: 'post',
      url: `${baseUrl}/space/v1/api/gateway/upload`,
      data: formData
    }).then(function (data) {
      resolve(data.data)
    })
  })
}

/**
 * 获得消息推送
 */
export function getMessagePoll() {
  let { accessToken } = getAccessTokenAndAseKey('native')
  let result
  result = get(
    `${baseUrl}/space/v1/api/gateway/poll?time=${new Date().getTime()}&accessToken=${accessToken}`
  )
  return result
}

/**
 * 获得绑定终端信息
 */
export function getTerminalInfo() {
  let params: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'personalinfo_show',
    serviceName: 'eulixspace-account-service'
  }

  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}



export function getServiceConfig(clientUUID,aoId) {
    let params = {
      apiVersion: 'v1',
      apiName: 'internet_service_get_config',
      serviceName: 'eulixspace-agent-service',
      queries: {
        clientUuid:clientUUID,aoId
      }
    }
    return post(`${baseUrl}/space/v1/api/gateway/call`, params)
  }