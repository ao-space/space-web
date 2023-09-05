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
 * 断点上传的一些帮助函数
 */
import SparkMD5 from 'spark-md5'
import { genPromise, blobToArrayBuffer, HexStr2Buffer } from '@/utils/help'

let chunkSize = 1024 * 1024 * 4 // btag 大小固定，和服务端约定的 4M
let partFileSize =  1024 * 1024 * 4
export interface TaskMap {
  [key: string]: Array<Promise<any>>
}

/**
 * 上传任务参数
 */
export interface UpTaskParams {
  uploadId: string
  totalSuccess?: Function
  totalFail: Function
  paramsArray: Array<any>
  progressTotal: Function
  notifyPageBeginUpload?: Function
  uploadedParts: Array<any>
  uploadController?
  mergePartToOneFile: Function
}

/**
 计算总进度
*/
export function countProgress(progressArray) {
  let total = 0,
    loaded = 0
  for (let i = 0; i < progressArray.length; i++) {
    let obj = progressArray[i]
    if (obj) {
      total = total + obj.total
      loaded = loaded + obj.loaded
    }
  }
  let percentWrap =
    (parseInt(<string>(<unknown>loaded) || '0') / parseInt(<string>(<unknown>total) || '100')) * 100
  let percent = Number(percentWrap).toFixed(2)
  return { total, loaded, percent }
}

export function needUpload(index, uploadedParts) {
  if (!uploadedParts) {
    return true
  }
  for (let i = 0; i < uploadedParts.length; i++) {
    let { start, end } = uploadedParts[i]
    if (start <= parseInt(index) && index < parseInt(end)) {
      return false
    }
  }
  return true
}

/**
 * 计算md5 并生成文件切片
 * @return
 */
export function genMd5AndFilePart(file, md5Controller) {
  let chunks = Math.ceil(file.size / partFileSize),
    currentChunk = 0,
    promiseArray = []
  let md5TaskArr = []
  while (currentChunk < chunks) {
    let { resolve, promise } = genPromise()
    promiseArray.push(promise)
    let start = currentChunk * partFileSize
    let end = start + partFileSize >= file.size ? file.size : start + partFileSize

    let singleMd5Task = (_file, _start, _end) => {
      return async (next) => {
        let blob = file.slice(start, end)
        let buffer = await blobToArrayBuffer(blob)
        let spark = new SparkMD5.ArrayBuffer()
        // 计算md5 值
        spark.append(buffer)
        let md5sum = spark.end(false)
        buffer = null
        blob = null
        // 分片计算成功
        resolve({ md5sum, start, end, file })
        next()
      }
    }
    currentChunk++
    md5TaskArr.push(singleMd5Task(file, start, end))
  }
  md5Controller.start(md5TaskArr)
  return promiseArray
}

/**
 * 生成btag
 */
export function genBtag(paramsArray) {
  let betag = ''
  if (paramsArray.length > 1) {
    let spark = new SparkMD5.ArrayBuffer()
    paramsArray.forEach((element) => {
      spark.append(HexStr2Buffer(element.md5sum))
    })

    betag = spark.end(false)
  } else {
    betag = paramsArray[0].md5sum
  }
  return betag
}

/**
 * 把后端上传范围，转成成前端上传色start 和 end
 */
export function dealUploadParts(uploadedParts) {
  if (uploadedParts) {
    uploadedParts = uploadedParts.map((item) => {
      // 这里建议为4M , 防止有交叉
      let { start, end } = item
      start = start / chunkSize
      end = end / chunkSize
      return { start, end }
    })
  }
  return uploadedParts
}
