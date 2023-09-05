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

import { DownOptions, SequelUploadParams } from '@/api/model'
import {
  sequelFileUpload,
  upLoadCreate,
  upLoadComplete,
  multiparDelete,
  noCryUpLoad
} from '@/api/file'

import { genNocryToken } from '@/business/login/loginUtils'

import { genPromise } from '@/utils/help'

import { stepBystep, StepController } from '@/utils/parallelUtils'
import {
  TaskMap,
  UpTaskParams,
  countProgress,
  needUpload,
  genMd5AndFilePart,
  genBtag,
  dealUploadParts
} from './sequelUpHelp'

import networkListener from '@/album/NetworkListener'

const chunkSize = 1024 * 1024 * 2 * 2 // 4M

/**
 * 正在上传的任务 btag:Array<Promise>
 */
const taskMap: TaskMap = {}

// 同时最大上传5个文件

const totalController: StepController = stepBystep({ count: 3, retryCount: 0 })

// step.1  文件切片并计算btag
// step.2  创建文件上传任务
// step.3  上传任务返回
//                   1.文件第一次上传, 调用切片上传函数
//                   2.文件已存在,直接进度100%,并调用总的成功函数
//                   3.文件部分上传, 调用切片上传函数 并在内部判断哪些切片不需要上传，哪些需要
// step.4  在上传函数内部，创建全部切片上传完回调，在回调内部调用合并接口，合并接口调用成功就调用总成功,失败就调用总失败
//                      创建函数开始调用上传开始回调函数
//                      开始调用上传队列，一步步调用具体上传函数
// step.5  具体切片上传函数内部，调用上传接口
//                                       1.成功就调用 合并接口(合并接口内部判断是否全部切片上传完，全部上传完，就调用合并)
//                                       2.失败就重试一次
//                                       3.不断调用进度事件,进度事件内部把每个切片的进度百分比通过加权合并成一个总的进度
//

/**
 * http 上传控制
 */
export async function httpfileUploadUtil(downOptions: DownOptions, folderPath: string) {
  const count = 3
  return SequelfileUploadUtil(downOptions, folderPath, totalController, count)
}

async function genFileMd5(file: File, md5Controller) {
  const fileName = file.name
  // 生成计算 文件md5 的promise 数组
  console.time(`${fileName}文件计算Md5`)
  const promiseArray = genMd5AndFilePart(file, md5Controller)
  const paramsArray = await Promise.all(promiseArray)
  console.timeEnd(`${fileName}文件计算Md5`)
  return paramsArray
}

/**
 * 总的上传逻辑
 */
async function SequelfileUploadUtil(
  downOptions: DownOptions,
  folderPath: string,
  totalFileUpController: StepController,
  count
) {
  // 总的文件上传控制器
  // 初始化一上传控制器
  const uploadController = stepBystep({
    count: count, // 单个文件同时上传数
    retryCount: 2,
    openLog: false,
    label: '上传控制器'
  })

  const onOffListener = () => {
    // @ts-ignore
    window.addEventListener('offline', uploadController.pause)
    // @ts-ignore
    window.addEventListener('online', uploadController.continueRun)
    return () => {
      // @ts-ignore
      window.removeEventListener('offline', uploadController.pause)
      // @ts-ignore
      window.removeEventListener('online', uploadController.continueRun)
    }
  }

  // 添加在线离线监听
  const removeListener = onOffListener()

  // md5 控制器为了控制当大文件在计算MD5时,用户点击取消，需要取消Md5的计算
  const md5Controller = stepBystep({ count: 6, retryCount: 0 })
  const { resolve, promise } = genPromise()
  const fn = async (next) => {
    // 开始计算md5 和 文件切片
    const { file } = downOptions
    const fileName = file.name

    // 计算btag
    console.time(`${fileName}计算btag`)
    const paramsArray = await genFileMd5(file, md5Controller)
    const betag = genBtag(paramsArray)

    console.timeEnd(`${fileName}计算btag`)
    // 创建一个相同betag的数组
    taskMap[betag] = taskMap[betag] || []
    // 等待上个相同betag的任务完成
    if (taskMap[betag].length > 0) {
      try {
        // 等待上一任务完成
        const lastBetagPromise = taskMap[betag][taskMap[betag].length - 1]
        // 把当前promise 放入到数组中
        taskMap[betag].push(promise)
        await lastBetagPromise
      } catch (error) {}
    } else {
      // 把当前promise 放入到数组中
      taskMap[betag].push(promise)
    }

    const success = downOptions.success
    const fail = downOptions.fail

    // 包装成功和失败,成功和失败需要做一些清理工作
    downOptions.success = (...arg) => {
      // 移除在线离线监听
      removeListener()
      // 当前任务完成 通知下一任务
      next()
      // 通知btag相同的文件,可以进行上传了
      resolve()
      // 通知当前文件上传成功
      success(...arg)
    }
    downOptions.fail = (...arg) => {
      try {
        // 移除在线离线监听
        removeListener()
        // 当前任务失败 通知下一任务
        next()
        // 通知btag相同的文件,可以进行上传了
        resolve()
        // 通知当前文件上传失败
        arg ? fail(arg) : fail(null)
        // 取消之后的任务
        uploadController.stop()
      } catch (e) {
        console.log(e, '9090')
      }
    }

    // 创建上传任务
    const { size, type: mime, lastModified: createTime, albumId } = file
    const BusinessId = albumId ? 2 : 0

    try {
      const params = {
        fileName,
        folderPath,
        betag,
        size,
        mime,
        createTime,
        albumId,
        BusinessId
      }
      console.time(`${file.name}创建上传任务耗时`)
      let createRes = await upLoadCreate(params)
      console.timeEnd(`${fileName}创建上传任务耗时`)
      if (createRes.code == 200) {
        const { rspType, completeInfo } = createRes.results
        if (rspType == 1) {
          // 进度直接100%
          downOptions.progress('100', { loaded: completeInfo.size, total: completeInfo.size })
          // 直接成功
          downOptions.success(null, { results: completeInfo })
        } else {
          const fnArray = dealTaskResultAndCreateUpFn(paramsArray, downOptions, betag, createRes)
          if (fnArray.length !== 0) {
            // 开始上传
            uploadController.start(fnArray)
            // 通知上传进度条
            downOptions.begin()
          }
        }
      } else {
        next()
        downOptions.fail(createRes)
      }
    } catch (e) {
      // e.response.code == 500 等待3秒钟在传下一个

      setTimeout(() => {
        console.error(e)
        next()
        downOptions.fail(e)
      }, 2000)
    }
  }

  totalFileUpController.start(fn)
  // 所有文件变化控制
  return {
    cancel: (status, uploadId) => {
      if (status == 1 && uploadId) {
        console.log('multipardelete ', multiparDelete(uploadId))
      }
      // 通知btag相同的文件,可以进行上传了
      resolve()
      totalFileUpController.removeFn(fn)
      totalFileUpController.next()
      uploadController.stop()
      md5Controller.stop()
      removeListener()
    },
    pause: () => {
      uploadController.pause()
      md5Controller.pause()
    },
    resume: () => {
      uploadController.continueRun()
      md5Controller.continueRun()
    }
  }
}

/**
 * 处理上传任务返回并创建文件上传任务队列
 */
function dealTaskResultAndCreateUpFn(paramsArray, downOptions: DownOptions, betag, createRes) {
  let fnArray = []
  const {
    file,
    name: fileName,
    progress: progressTotal,
    success: totalSuccess,
    fail: totalFail
  } = downOptions

  // 合并文件分片回调
  const mergePartToOneFile = async (uploadId, isHttp, num) => {
    const flag = `${file.name} 合并耗时: `
    console.time(flag)
    const res = await upLoadComplete(uploadId)
    console.timeEnd(flag)
    if (res.code == 200) {
      totalSuccess(null, res, num)
    } else {
      console.error(fileName, 'betag:', betag, 'uploadId', uploadId, '原因:', res)
      console.error(`isHttp:${isHttp}`)
      totalFail(res)
    }
  }
  const upTaskParams: UpTaskParams = {
    uploadId: '0',
    uploadedParts: [],
    totalFail,
    paramsArray,
    progressTotal,
    mergePartToOneFile
  }

  const { results } = createRes
  const { rspType, succInfo, conflictInfo } = results

  if (rspType === 0) {
    upTaskParams.uploadId = succInfo.uploadId
  } else if (rspType === 2) {
    const { uploadedParts } = conflictInfo
    if (uploadedParts && uploadedParts.length === 1) {
      const { size } = file
      // 已上传完成,单未调用合并
      const { start, end } = uploadedParts[0]
      if (start === 0 && end === size) {
        progressTotal('100', { loaded: size, total: size })
        // @ts-ignore
        mergePartToOneFile(conflictInfo.uploadId, false)
        return fnArray
      }
    }
    upTaskParams.uploadId = conflictInfo.uploadId
    upTaskParams.uploadedParts = uploadedParts || []
    //  把后端上传范围，转成成前端上的start 和 end
    upTaskParams.uploadedParts = dealUploadParts(uploadedParts)
  }
  fnArray = createUploadFileFn(upTaskParams)
  return fnArray
}

/**
 * 创建上传任务数组
 */
function createUploadFileFn(upTaskParams: UpTaskParams) {
  const fnArray = []

  const { uploadedParts, uploadId, totalFail, paramsArray, progressTotal, mergePartToOneFile } =
    upTaskParams

  // 循环上传切片
  const progressArray = new Array(paramsArray.length)

  let totalTask = paramsArray.length

  let httpNum = 0

  for (let i = 0; i < paramsArray.length; i++) {
    const needFlag = needUpload(i, uploadedParts)
    if (!needFlag) {
      // fixbug 657
      totalTask--
      progressArray[i] = { percent: '100', loaded: chunkSize, total: chunkSize }
    } else {
      const { md5sum, start, end, file } = paramsArray[i]
      const total = end - start
      progressArray[i] = { percent: 0, loaded: 0, total: total }
      const sequelUploadParams: SequelUploadParams = {
        md5sum,
        uploadId,
        start,
        end,
        index: i,
        file: file.slice(start, end),
        progress: (percent, all) => {
          const { loaded } = all
          // 把每次上传的进度保存到数组中
          progressArray[i] = { percent, loaded, total }
          // 计算进度
          const result = countProgress(progressArray)

          // @ts-ignore
          // 把uploadId 返回给前端 方便取消
          result.uploadId = uploadId
          //  通知进度
          progressTotal(result.percent, result)
        }
      }

      console.log('file params', sequelUploadParams)

      // 尝试合并及调用下一个上传函数
      const tryMergeAllPartFile = () => {
        totalTask--

        httpNum++
        // console.log(`${file.name} 剩余任务数:`, totalTask)
        if (totalTask === 0) {
          mergePartToOneFile(uploadId, false, {
            httpNum,
            totalNum: paramsArray.length
          })
        }
      }

      fnArray.push(async (invokeNextFn) => {
        const upFileFn = async (sequelUploadParamsInner: SequelUploadParams, retryCount) => {
          try {
            // console.time(flag)
            if (
              //如果是局域网走不加密
              !networkListener.isWan()
            ) {
              const token = genNocryToken()
              await noCryUpLoad(sequelUploadParamsInner, token)
            } else {
              await sequelFileUpload(sequelUploadParamsInner)
            }

            // console.timeEnd(flag)
            tryMergeAllPartFile()
            invokeNextFn()
          } catch (failInfo) {
            // console.timeEnd(flag)
            console.log('fail:', failInfo)
            if (failInfo && (failInfo.code == 1037 || failInfo.code == 1013)) {
              // 分片范围已上传,文件已存在,代表当前分配已成功上传
              // 尝试调用合并文件
              tryMergeAllPartFile()
              invokeNextFn()
            } else {
              // 如果上传失败了,并且重试次数为0,直接失败
              const { start, end } = sequelUploadParamsInner
              if (retryCount === 0) {
                console.log('上传文件:', start, '-', end, '失败')
                totalFail(failInfo)
              } else {
                // 默认是http 兜底
                console.log('改为http兜底', start, '-', end)
                upFileFn(sequelUploadParamsInner, retryCount - 1)
              }
            }
          }
        }
        // 失败了,就重试2次
        upFileFn(sequelUploadParams, 2)
      })
    }
  }

  return fnArray
}
