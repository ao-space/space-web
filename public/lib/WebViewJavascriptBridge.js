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

//notation: js file can only use this kind of comments
//since comments will cause error when use in webview.loadurl,
//comments will be remove by java use regexp
;(function () {
  if (window.WebViewJavascriptBridge) {
    return
  }
  // 创建一个全局的对象，用于被native直接调用的js方法
  let nativeCallJSMethodObj = {}

  let responseCallbacks = {}

  function genPromise() {
    let reject, promise, resolve
    // eslint-disable-next-line prefer-const
    promise = new Promise((r, j) => {
      resolve = r
      reject = j
    })
    return { reject, promise, resolve }
  }

  /**
   * message:{params:{},jsCallbackId:string,methodName:string}
   *  class<T> {
   *    jsCallbackId:string,
   *    params<T>
   * }
   *
   * xx extends class<JS>{
   * }
   *
   * abc{
   *  aaa:
   * ff:
   * }
   *   string => function
   *
   */
  function sendMessageToNative(methodName, params) {
    let proObj = genPromise()
    let jsCallbackId = 'cb_' + methodName + '_' + new Date().getTime()
    let message = {
      params: params || {},
      method: methodName,
      jsCallbackId: jsCallbackId,
    }

    // responseData:{code:200,data:{}|[],msg:""}
    responseCallbacks[jsCallbackId] = function (responseData) {
      if (responseData.code == 200) {
        proObj.resolve(responseData.data)
      } else {
        proObj.reject(responseData)
      }
    }

    console.log('sendMessageToNative==>', methodName, message)
    if (window.JScallNativeAppletObj) {
      console.log('调用android方法传参:', message)
        window.JScallNativeAppletObj.jsCallNativeMethod(JSON.stringify(message))
    } else if (window.webkit && window.webkit.messageHandlers) {
      const method = window.webkit.messageHandlers[methodName]
      if (method) {
        console.log('调用ios方法传参:', message)
        method.postMessage(message)
      } else {
        console.log(methodName, params, '调用ios失败,方法不存在')
      }
    }

    return proObj.promise
  }

  /**
   * native 回调js
   * messageJSON:{jsCallbackId:'xxx',responseCallback:{code:200,data:{}|[],msg:""}}
   */
  function dispatchMessageFromNative(messageJSON) {
    setTimeout(function () {
      let message = JSON.parse(messageJSON)
      console.log('dispatchMessageFromNative 参数被json化了==>', messageJSON)
      let responseCallback
      if (message.jsCallbackId) {
        responseCallback = responseCallbacks[message.jsCallbackId]
        if (!responseCallback) {
          return
        }
        console.log('dispatchMessageFromNative js回调方法==>', responseCallback)
        responseCallback(message.responseData)
        delete responseCallbacks[message.jsCallbackId]
      }
    })
  }

  /**
   * native 直接调用js
   */
  function nativeCallJsMethod(messageJSON) {
    let returnValue = { code: 200, data: {}, msg: '' }
    let callbackId = '-1'
    let tmpMethodName
    try {
      let message = JSON.parse(messageJSON)
      let jsmethodName = message.jsmethodName
      tmpMethodName = jsmethodName
      let params = message.params

      if (nativeCallJSMethodObj[jsmethodName]) {
        let data = nativeCallJSMethodObj[jsmethodName](params)
        returnValue.data = data
      } else {
        returnValue.code = -1
        returnValue.msg = 'native 调用js失败,方法不存在'
      }
    } catch (e) {
      returnValue.code = -2
      returnValue.msg = 'native 调用js失败, native 传给js的参数无法json格式化'
    }
    if (window.webkit && window.webkit.messageHandlers) {
      const method = window.webkit.messageHandlers.dispatchMessageFromJs

      let responseMessage = {
        responseData: returnValue,
        callbackId: callbackId,
      }
      if (method) {
        console.log('ios 调js:::',tmpMethodName, responseMessage)
        method.postMessage(responseMessage)
      }
    }
    return JSON.stringify(returnValue)
  }

  window.WebViewJavascriptBridge = {
    sendMessageToNative: sendMessageToNative,
    dispatchMessageFromNative: dispatchMessageFromNative,
    nativeCallJsMethod: nativeCallJsMethod,
  }

  let doc = document
  let readyEvent = doc.createEvent('Events')
  readyEvent.initEvent('WebViewJavascriptBridgeReady')
  readyEvent.bridge = window.WebViewJavascriptBridge
  doc.dispatchEvent(readyEvent)
})()
