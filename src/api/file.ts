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

import { post } from './network.js'

import { RealCallRequest, UpLoadCreate, SequelUploadParams, progressFn } from './model'
import { downLoadFile } from './downUpUtil'
import { DownOptions } from './model'
import { genParams } from '@/auth/index'
import { fileMd5 } from '@/utils/help'
import { encyptFile, decryptFile } from '@/auth/index'
import { saveAs } from 'file-saver'
import { bussAseDecrypt } from '../auth/index'
import { urlConfig, xhrUpLoadTimeout } from '@/config/networkConfig'
let baseUrl = urlConfig.baseUrl
import { genPromise, arrayBufferToString } from '@/utils/help'

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
  断点续传文件上传
*/
export async function sequelFileUpload(sequelUploadParams: SequelUploadParams) {
  let { promise, resolve, reject } = genPromise()
  let { progress } = sequelUploadParams
  let downOptions = {} as DownOptions
  downOptions.url = `${urlConfig.baseUrl}/space/v1/api/gateway/upload`
  downOptions.type = 'upload'
  downOptions.progress = progress as progressFn
  let name = sequelUploadParams.md5sum
  let { md5sum, uploadId, start, end } = sequelUploadParams
  let params = {
    apiVersion: 'v1',
    apiName: 'multipart_upload',
    queries: {
      md5sum,
      uploadId,
      start,
      end
    },
    serviceName: 'eulixspace-file-service'
  }

  let data = await genParams(params)
  let formData = new FormData()
  formData.append(
    'callRequest',
    new Blob([JSON.stringify(data)], {
      type: 'application/json'
    })
  )
  formData.append('filename', name)
  let encryptedFile = await encyptFile({ file: sequelUploadParams.file, name: name })

  formData.append('file', encryptedFile)
  downOptions.uploadParam = formData
  downOptions.timeout = 80 * 1000
  downOptions.success = async (error, response) => {
    // todo 这里的response 需要解析一下
    encryptedFile = null
    // console.log('response===>', response)
    let { body, code } = response
    if (code == 200) {
      body = await bussAseDecrypt(body)
      // console.log('解密之后的返回::', body)
      if (body.code == 200) {
        resolve({ error, body })
      } else {
        reject(body)
      }
    } else {
      reject(error)
    }
  }
  downOptions.fail = (e) => {
    reject(e)
  }

  downLoadFile(downOptions)
  return promise
}

/**
 * 无需2次加密上传
 */
export function noCryUpLoad(sequelUploadParams: SequelUploadParams, token) {
  let { promise, resolve, reject } = genPromise()
  let { progress } = sequelUploadParams

  let { md5sum, uploadId, start, end } = sequelUploadParams
  const queryStr = `md5sum=${md5sum}&uploadId=${uploadId}&start=${start}&end=${end}&requestId=${new Date().getTime()}`

  let downOptions = {} as DownOptions
  downOptions.url = `${urlConfig.baseUrl}/space/v1/api/multipart/upload?${queryStr}`
  downOptions.type = 'upload'
  downOptions.progress = progress as progressFn
  downOptions.uploadParam = sequelUploadParams.file
  downOptions.timeout = 80 * 1000
  downOptions.headers = { token }
  downOptions.success = async (error, response) => {
    let { body, code } = response
    if (code == 200) {
      resolve({ error, body })
    } else {
      reject(error)
    }
  }
  downOptions.fail = (e) => {
    reject(e)
  }

  downLoadFile(downOptions)

  return promise
}

/**
 * 文件上传
 */
export async function fileUpload(downOptions: DownOptions, path) {
  downOptions.url = `${urlConfig.baseUrl}/space/v1/api/gateway/upload`
  downOptions.type = 'upload'
  downOptions.timeout = xhrUpLoadTimeout
  const { file, name, success, fail } = downOptions
  // 加密文件
  let encryptedFile = await encyptFile({ file: file, name: name })
  // 计算md5值
  let md5sum = await fileMd5(file)
  let params = {
    apiVersion: 'v1',
    apiName: 'upload_file',
    entity: {
      md5sum: md5sum,
      filename: name,
      size: encryptedFile.size,
      mediaType: 'application/octet-stream',
      path: path
    },
    serviceName: 'eulixspace-file-service'
  }

  let data = await genParams(params)

  let formData = new FormData()
  formData.append(
    'callRequest',
    new Blob([JSON.stringify(data)], {
      type: 'application/json'
    })
  )
  formData.append('filename', name)
  formData.append('file', encryptedFile)
  downOptions.uploadParam = formData

  downOptions.success = async (error, response) => {
    let { body, code } = response
    if (code == 200) {
      body = await bussAseDecrypt(body, 'cryptojs')
      console.log('解密之后的返回::', body)
      if (body.code == 200) {
        success(error, body)
      } else {
        fail(body)
      }
    } else {
      fail(body)
    }
  }

  return downLoadFile(downOptions)
}

/**
 * 无需2次加密下载
 */
export async function noCryFileDownLoad(downOptions: DownOptions, uuid, token) {
  downOptions.url = `${urlConfig.baseUrl}/space/v1/api/file/download?uuid=${uuid}`
  downOptions.type = 'download'
  downOptions.method = 'GET'
  downOptions.timeout = 80 * 1000
  downOptions.headers = { Range: downOptions.range, token }
  return downLoadFile(downOptions)
}

/**
 * 文件下载
 */
export async function fileDownLoad(downOptions: DownOptions, uuid) {
  downOptions.url = `${urlConfig.baseUrl}/space/v1/api/gateway/download`
  downOptions.type = 'download'
  let data = {
    apiVersion: 'v1',
    queries: { uuid: uuid },
    apiName: 'download_file',
    serviceName: 'eulixspace-file-service',
    headers: {} as any
  }
  // 文件部分下载
  if (downOptions.range) {
    data.headers.Range = downOptions.range
    // 设置超时时间为80秒
    downOptions.timeout = 80 * 1000
  }

  let result = await genParams(data)
  downOptions.downloadParam = JSON.stringify(result)
  return _fileDownLoad(downOptions)
}

function _fileDownLoad(downOptions: DownOptions) {
  const { name, autoSave } = downOptions
  const success = downOptions.success
  const fail = downOptions.fail

  let needJiemi = true
  if (needJiemi) {
    downOptions.success = (error, blob) => {
      decryptFile((<unknown>blob) as Blob).then((arrayBuffer) => {
        let newBlob = new Blob([arrayBuffer])
        if (autoSave) {
          // 方法1 用file-saver 来保存
          saveAs(newBlob, name)
        }
        typeof success == 'function' && success(null, newBlob)
      })
    }
    downOptions.fail = (e) => {
      let response
      if (e instanceof XMLHttpRequest) {
        if (e.status === 404) {
          response = e.response
        } else {
          typeof fail === 'function' && fail(e)
        }
      } else if (e instanceof ProgressEvent) {
        // 跨域问题会导致这个问题
        typeof fail === 'function' && fail(e)
      } else {
        response = new Blob([e])
      }
      if (response) {
        decryptFile(response).then((arrayBuffer) => {
          arrayBufferToString(arrayBuffer).then((str) => {
            try {
              const strJson = JSON.parse(str)
              typeof fail === 'function' && fail(strJson)
            } catch (error) {
              typeof fail === 'function' && fail(str)
            }
          })
        })
      }
    }
  } else {
    downOptions.success = (error, blob) => {
      let newBlob = new Blob([blob])
      // console.log('newBlob', newBlob)
      newBlob.arrayBuffer().then((buffer) => {
        console.log(buffer)
      })
      if (autoSave) {
        // 方法1 用file-saver 来保存
        saveAs(newBlob, name)
      }
      typeof success == 'function' && success(null, newBlob)
    }
  }

  return downLoadFile(downOptions)
}

/**
 * 返回缩略图
 */
export async function fileThumb(downOptions: DownOptions, uuid, size) {
  downOptions.url = `${urlConfig.baseUrl}/space/v1/api/gateway/download`
  downOptions.type = 'download'
  let data = {
    apiVersion: 'v1',
    queries: { uuid: uuid, size },
    apiName: 'download_thumbnails',
    serviceName: 'eulixspace-filepreview-service'
  }
  let result = await genParams(data)
  downOptions.downloadParam = JSON.stringify(result)
  return _fileDownLoad(downOptions)
}

/**
 * 返回压缩图
 */
export async function fileCompressed(downOptions: DownOptions, uuid) {
  downOptions.url = `${urlConfig.baseUrl}/space/v1/api/gateway/download`
  downOptions.type = 'download'
  let data = {
    apiVersion: 'v1',
    queries: { uuid: uuid },
    apiName: 'download_compressed',
    serviceName: 'eulixspace-filepreview-service'
  }
  let result = await genParams(data)
  downOptions.downloadParam = JSON.stringify(result)
  return _fileDownLoad(downOptions)
}

export async function getHeaderImage(downOptions: DownOptions, aoid) {
  downOptions.url = `${urlConfig.baseUrl}/space/v1/api/gateway/download`
  downOptions.type = 'download'
  let data = {
    apiVersion: 'v1',
    queries: { aoid: aoid },
    apiName: 'image_show',
    serviceName: 'eulixspace-account-service'
  }
  let result = await genParams(data)
  downOptions.downloadParam = JSON.stringify(result)
  return _fileDownLoad(downOptions)
}

/**
 * 删除未完成的任务
 */
export async function multiparDelete(uploadId) {
  let params: RealCallRequest<any, any> = {
    apiVersion: 'v1',
    apiName: 'multipart_delete',
    serviceName: 'eulixspace-file-service',
    entity: {
      uploadId
    }
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, params)
}
