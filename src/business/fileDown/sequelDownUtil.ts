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

import { FileStruct, DownOptions } from '@/api/model'
import { setCacheInfo, getCacheInfo } from '@/utils/indexdbUtil'

import { fileDownLoad, noCryFileDownLoad } from '@/api/file'
import { genPromise } from '@/utils/help'
import { stepBystep } from '@/utils/parallelUtils'

import {
  DownRecordInfo,
  DownRecordMap,
  TaskMapPromise,
  getSomeBetagPrePromiseAndCurrentPromise,
  isAllReady,
  getAllBlobFromIndexDb,
  countProgress
} from './sequelDownHelp'
import networkListener from '@/album/NetworkListener'
import { genNocryToken } from '@/business/login/loginUtils'

let chunkSize = 1024 * 1024 * 2 * 2 // 4M

// 任务 promise 数组
let taskMapPromise: TaskMapPromise = {}

// http同时开启3个下载
let httpDownController = stepBystep({ count: 3, retryCount: 0 })

/**
 * http 下载控制
 */
export async function httpfileDownUtil(downOptions: DownOptions, fileStruct: FileStruct) {
  return SequelfileDownUtil(downOptions, fileStruct, httpDownController, 3)
}

// 断点续传下载
// 文件大于chunkSize 才开启断点续传
// 断点续传  开启几个下载链接，下载完存入到indexdb
// 下载之前根据 indexdb 中的 下载记录 来确定已下载多少
// 每个下载记录 对应一条
// 下载记录  betag:{downList:[{start,end}],lastModifyed:''}
// 每一条记录 betag-start-end:blob
// 取记录的，检验长度是否为end-start 通过及跳过，未通过就继续下
/**
 * @param parallelDownController 并行下载控制器
 */
export async function SequelfileDownUtil(
  downOptions: DownOptions,
  fileStruct: FileStruct,
  parallelDownController,
  count
) {
  // 初始化下载控制器 单个文件最大同时3个xhr下载
  let downController = stepBystep({ count: count, retryCount: 1 })
  let { pause, continueRun, start: beginStart, retryTask } = downController
  // @ts-ignore
  window.addEventListener('offline', pause)
  // @ts-ignore
  window.addEventListener('online', continueRun)

  // 并行下载控制器
  let { start, removeFn } = parallelDownController

  let {
    success: totalSucess,
    progress: progressTotal,
    fail: totalFail,
    begin: notifyPageBeginUpload
  } = downOptions
  //检查一下是否有相同内容的文件在下载
  let betag = fileStruct.betag
  taskMapPromise[betag] = taskMapPromise[betag] || []
  let { prePromise, resolve, reject, curPromise } = getSomeBetagPrePromiseAndCurrentPromise(
    taskMapPromise[betag]
  )
  taskMapPromise[betag].push(curPromise)
  //包装totalSuccess 和 totalFail
  let totalSuccessWrap = (...arg) => {
    resolve()
    // @ts-ignore
    totalSucess && totalSucess(...arg)
  }

  let totalFailWrap = (arg) => {
    console.log('下载fail:', arg)
    totalFail && totalFail(arg)
    reject()
  }

  prePromise = prePromise || Promise.resolve()
  let { resolve: outResolve, promise } = genPromise()
  // 如果有相同内容文件下载存在,等待其完成
  prePromise.then(() => {
    getCacheInfo(`${fileStruct.betag}-sequelDownInfo`).then((downRecordMap) => {
      // 计算indexdb 中缓存了多少数据

      downRecordMap = downRecordMap || ({} as DownRecordMap)
      let fileCallbackMap = { progressTotal, totalFailWrap, totalSuccessWrap }
      // 生成下载任务数组
      let downTaskArr = genDownTaskArr(
        fileStruct,
        downRecordMap,
        downOptions,
        fileCallbackMap,
        retryTask
      )
      // 如果下载任务为空,直接从缓存取文件
      if (downTaskArr.length == 0) {
        getFileFromIndexdb(fileStruct, fileCallbackMap)
        return
      }

      let currentFileTask = async (nextTask) => {
        beginStart(downTaskArr)
        // 当前任务完成通知下一任务开始
        try {
          await curPromise
        } catch (error) {
        } finally {
          nextTask()
        }
      }
      // 开始下载任务
      start(currentFileTask)
      notifyPageBeginUpload()
      outResolve(currentFileTask)
    })
  })

  return {
    cancel: () => {
      promise.then((fileTask) => {
        removeFn(fileTask)
      })
      downController.stop()
      // @ts-ignore
      window.removeEventListener('online', continueRun)
      // @ts-ignore
      window.removeEventListener('offline', pause)
      taskMapPromise[betag] = []
      parallelDownController.next()
    },
    pause: () => {
      pause()
    },
    resume: () => {
      continueRun()
    }
  }
}

/**
 * 生成下载任务
 */
function genDownTaskArr(fileStruct, downRecordMap, downOptions, fileCallbackMap, retryTask) {
  let { progressTotal, totalSuccessWrap, totalFailWrap } = fileCallbackMap
  let { size } = fileStruct
  let downTaskArr = [],
    taskLength = size % chunkSize == 0 ? size / chunkSize : parseInt(size / chunkSize + '') + 1,
    beginIndex = 0,
    beginSize = 0,
    // 进度缓存数组
    progressArray = new Array(taskLength),
    // 成功数组
    readyArr = new Array(taskLength).fill(-1),
    // 文件下载记录
    downinfo: DownRecordMap = {}

  // http 下载的分片数
  let httpNum = 0
  while (beginSize < size) {
    let endSize = beginSize + chunkSize
    if (endSize > size) {
      endSize = size
    }
    // 当前块已存在缓存中
    if (downRecordMap[beginIndex]) {
      readyArr[beginIndex] = 1
    } else {
      let { tmpOption, saveKey, index } = initDownParams(
        beginSize,
        endSize,
        beginIndex,
        progressArray,
        downOptions,
        fileStruct,
        downinfo,
        progressTotal
      )
      let taskFn = (nextTask) => {
        // 通知成功
        tmpOption.success = async (err, blob) => {
          // 触发下一个下载任务

          httpNum++

          nextTask()
          try {
            let totalFileBlob = await downSuccess(
              readyArr,
              index,
              saveKey,
              blob,
              fileStruct,
              downinfo
            )
            if (totalFileBlob) {
              totalSuccessWrap(null, totalFileBlob, { httpNum, totalNum: taskLength })
            }
          } catch (e) {
            console.log('下载发送错误:', e)
          }
        }

        tmpOption.fail = (e) => {
          if (e && e.code === 1003) {
            // 文件不存在
            console.log(e)
            totalFailWrap(e)
          } else {
            retryTask(taskFn, () => {
              console.log(`第${index + 1}下载失败回调完成`)
              totalFailWrap(e)
            })
          }
        }
        if (!networkListener.isWan()) {
          const token = genNocryToken()
          console.log('走的不加密下载')
          noCryFileDownLoad(tmpOption, fileStruct.uuid, token)
        } else {
          fileDownLoad(tmpOption, fileStruct.uuid)
        }
      }
      downTaskArr.push(taskFn)
    }
    beginIndex++
    beginSize = endSize
  }
  return downTaskArr
}

/**
 * 从indexdb中读取缓存生成文件
 */
async function getFileFromIndexdb(fileStruct, fileCallbackMap) {
  let { progressTotal, totalSuccessWrap, totalFailWrap } = fileCallbackMap
  try {
    let progressArray = []
    let downinfo = <DownRecordMap>await getCacheInfo(`${fileStruct.betag}-sequelDownInfo`)
    let arrBlob = await getAllBlobFromIndexDb(downinfo)
    arrBlob.forEach((blob) => {
      progressArray.push({ percent: '100.00', loaded: blob.size, total: blob.size })
    })
    // 计算总进度
    let result = countProgress(progressArray)
    //  通知总进度
    progressTotal(result.percent, result)
    totalSuccessWrap(null, new Blob(arrBlob))
  } catch (e) {
    console.error(e)
    totalFailWrap()
  }
}

/**
 * 初始化下载参数
 * 1.生成单块保存在indexdb中的key
 * 2.初始化单块缓存记录
 * 3.保存当前index
 */
function initDownParams(
  beginSize,
  endSize,
  index,
  progressArray,
  downOptions,
  fileStruct,
  downinfo,
  progressTotal
) {
  let saveKey = `${fileStruct.betag}-${beginSize}-${endSize - 1}`
  //缓存记录
  let recordInfo: DownRecordInfo = {
    scope: { beginSize: beginSize, endSize: endSize - 1 },
    expires: new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
    saveKey: saveKey
  }
  //记录当前下载记录
  downinfo[index] = recordInfo
  // 初始化进度数组
  progressArray[index] = { percent: 0, loaded: 0, total: endSize - beginSize }

  let tmpOption: DownOptions = {
    ...downOptions,
    range: `bytes=${beginSize}-${endSize - 1}`,
    progress: (percent, all) => {
      const { loaded } = all
      // 记录当前块进度
      progressArray[index].percent = percent
      progressArray[index].loaded = loaded
      // 计算总进度
      let result = countProgress(progressArray)
      //  通知总进度
      progressTotal(result.percent, result)
    }
  }

  return { tmpOption, saveKey, index }
}

async function downSuccess(readyArr, index, saveKey, blob, fileStruct, downinfo) {
  // 存储blob
  let tmpArr = saveKey.split('-')
  let size = tmpArr[2] - tmpArr[1]
  if (size != blob.size - 1) {
    console.error('saveKey', saveKey, blob.size, size)
  }
  let setBlobPromise = setCacheInfo(saveKey, blob)
  try {
    readyArr[index] = 1
    if (isAllReady(readyArr)) {
      // 把下载记录记录到indexdb中
      await setCacheInfo(`${fileStruct.betag}-sequelDownInfo`, downinfo)
      await setBlobPromise
      let arrBlob = await getAllBlobFromIndexDb(downinfo)
      return new Blob(arrBlob)
    }
  } catch (e) {
    console.error('存储文件下载缓存失败', e)
    throw new Error('存储文件下载缓存失败')
  }
  return null
}
