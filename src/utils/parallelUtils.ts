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

export interface RetryFn {
  // 重试最后一次失败回调
  (allFailCallback: Function): void
}
export interface StepFn {
  __$$retryNum: Number
  (next: Function): void
}

export interface StepController {
  start: Function
  pause: Function
  continueRun: Function
  setFnArray: Function
  stop: Function
  removeFn: Function
  next: Function
  retryTask: Function
  currentCount: number
  count: Number
}

/**
 *  并行控制器 给定 X 个待执行函数, 同时执行 count> x ?x : count 个函数
    最多同时调用count 个函数，一个函数结束调用另外一个, 直到所有的函数都被调用结束
    @param count 同时调用count 函数
    @param retryCount 调用失败,重试几次
  */
export function stepBystep({
  count,
  retryCount,
  openLog,
  label
}: {
  count: Number
  retryCount?: Number
  openLog?: Boolean
  label?: String
}): StepController {
  let fnArray = new Array<StepFn>()
  let currentCount = 0
  retryCount = retryCount || 0
  openLog = openLog || false
  label = label || ''
  let pauseFlag = false // 暂停标志位
  // 继续下一步
  function next() {
    currentCount--
    if (openLog) {
      console.log('调用下一个函数', currentCount, label)
    }

    _start()
  }

  // 启动
  function _start() {
    if (!pauseFlag) {
      while (fnArray.length && currentCount < count) {
        let fn = fnArray.shift()
        // 防止进入死循环
        if (fn.__$$retryNum == undefined && retryCount) {
          fn.__$$retryNum = retryCount
        }
        if (typeof fn == 'function') {
          currentCount++
          execTaskFn(fn)
        }
      }
    }
  }

  // 重试
  function retryTask(taskFn, finishCallback) {
    if (!isNaN(taskFn.__$$retryNum) && taskFn.__$$retryNum > 0) {
      taskFn.__$$retryNum = taskFn.__$$retryNum - 1
      console.log('重试', taskFn.__$$retryNum)
      // 把函数添加到队列头部,继续执行
      fnArray.unshift(taskFn)
      next()
    } else {
      finishCallback()
    }
  }

  function execTaskFn(taskFn) {
    try {
      taskFn(next)
    } catch (e) {
      console.log(e)
      next()
    }
  }

  // 对外暴露的启动函数
  function start(outFnArray) {
    if (Array.isArray(outFnArray)) {
      fnArray = fnArray.concat(outFnArray)
    } else if (typeof outFnArray == 'function') {
      fnArray = fnArray || []
      fnArray.push(outFnArray)
    }
    _start()
  }

  // 暂停
  function pause() {
    pauseFlag = true
  }

  // 继续执行
  function continueRun() {
    pauseFlag = false
    _start()
  }

  function stop() {
    fnArray = []
    currentCount = 0
  }

  function removeFn(fn) {
    let index = fnArray.findIndex((item) => {
      return item == fn
    })
    if (index != -1) {
      fnArray.splice(index, 1)
    }
  }

  function setFnArray(outFnArray) {
    fnArray = outFnArray
  }

  return {
    start: start,
    pause,
    continueRun,
    setFnArray,
    stop,
    removeFn,
    next,
    retryTask,
    currentCount,
    count,
    fnArray
  }
}
