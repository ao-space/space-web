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

import SparkMD5 from 'spark-md5'
import { throttle } from 'lodash'
import CryptoJS from 'crypto-js'
import i18n from '@/language/index'
import { onBeforeMount, ref } from 'vue'
import { toByteArray } from './base64'

export async function isImgBlob(blob) {
  let { resolve, promise, rej } = genPromise()
  try {
    let arraybuffer = await blobToArrayBuffer(blob)
    let str = await arrayBufferToString(arraybuffer)
    if (str.indexOf('404 page not found') > -1) {
      rej()
    } else {
      let res = JSON.parse(<string>str)
      // 能正常解析为json 代表压缩图还未生成 直接下载原图
      rej()
    }
  } catch (e) {
    // console.log('abc', e)
    // 缓存压缩图
    resolve()
  }
  return promise
}

/**
 * arrayBuffer 转 string
 */
export function arrayBufferToString(u) {
  let resolve
  let promise = new Promise<string>(function (res, rej) {
    resolve = res
  })
  let  b = new Blob([u])
  let r = new FileReader()
  r.readAsText(b, 'utf-8')
  r.onload = function () {
    resolve(r.result)
  }
  return promise
}

export function appendFormDataToBoby(body, boundary) {
  let tmp = new Blob([], { type: 'application/octet-stream' })
  // console.log(body.entries())
  for (let  pair of body.entries()) {
    let [key, value] = pair
    let str = `--${boundary}\r\n`
    if (value instanceof File) {
      str = str + `Content-Disposition: form-data; name="${key}"; filename="${value.name}"\r\n`
      str = str + `Content-Type: ${value.type}\r\n`
    } else {
      str = str + `Content-Disposition: form-data; name="${key}"\r\n`
    }
    str = str + '\r\n'
    tmp = new Blob([tmp, str, value, '\r\n'], {
      type: 'application/octet-stream'
    })
  }
  tmp = new Blob([tmp, `--${boundary}--`, '\r\n'])
  return tmp
}

/**
 制字符串转成arraybuffer 把16进
*/
export function HexStr2Buffer(hex) {
  let  buffer = new ArrayBuffer(hex.length / 2)

  let  byteStream = new Uint8Array(buffer)

  let  i = 0

  while (hex.length >= 2) {
    let  x = parseInt(hex.substring(0, 2), 16)

    hex = hex.substring(2, hex.length)

    byteStream[i++] = x
  }

  return buffer
}

export function strToHex(str) {
  if (str === '') return ''
  let hexCharCode = ''
  for (let  i = 0; i < str.length; i++) {
    hexCharCode += str.charCodeAt(i).toString(16)
  }
  return hexCharCode
}

/**
 * 把number转换成16进制
 */
export function int2hex(num) {
  let  hex = '0123456789abcdef'
  let  s = ''
  while (num) {
    s = hex.charAt(num % 16) + s
    num = Math.floor(num / 16)
  }
  return s
}

/**
 * 生成promise 并把promise的res 和 rej 给暴露出去
 */
export function genPromise() {
  let res, rej, promise, resolve, reject
  promise = new Promise((r, j) => {
    res = r
    resolve = r
    rej = j
    reject = j
  })
  return { res, rej, promise, resolve, reject }
}

/**
 * 生成随机字符串
 */
export function randomString(length) {
  let  str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let  result = ''
  for (let  i = length; i > 0; --i) result += str[Math.floor(Math.random() * str.length)]
  return result
}

/**
 * 文件md5加密 返回一个promise promise的res 返回的是字符串
 */
export function fileMd5(file) {
  let { res, rej, promise } = genPromise()
  // @ts-ignore
  let  blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
    chunkSize = 2097152 * 5 * 2, // Read in chunks of 2MB
    chunks = Math.ceil(file.size / chunkSize),
    currentChunk = 0,
    spark = new SparkMD5.ArrayBuffer(),
    fileReader = new FileReader()
  let requestIdleCallback = window.requestIdleCallback || window.setTimeout
  fileReader.onload = function (e) {
    // console.log('read chunk nr', currentChunk + 1, 'of', chunks)
    spark.append(e.target.result) // Append array buffer
    currentChunk++

    if (currentChunk < chunks) {
      requestIdleCallback(loadNext)
    } else {
      fileReader = null
      //   console.timeEnd('mainMD5')
      res(spark.end())
    }
  }

  fileReader.onerror = function () {
    console.warn('oops, something went wrong.')
  }

  function loadNext() {
    let  start = currentChunk * chunkSize,
      end = start + chunkSize >= file.size ? file.size : start + chunkSize

    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
  }

  requestIdleCallback(loadNext)
  return promise
}
//
// export function getParamsFromUrl(name) {
//   let  reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
//   let  r = decodeURIComponent(location.href).match(reg)
//   if (r != null) {
//     sessionStorage.setItem(name, r[2])
//   }
//   return r ? r[2] : ''
// }
export function getParamsFromUrl(name) {
  // 捕获url 中以 ?或者& 开头的中间为name= 的name= 之后的一直到不为&的字符串
  let  reg = new RegExp('(\\?|&)' + name + '=([^&#]*)', 'i')
  let  r = decodeURIComponent(location.href).match(reg)
  if (r != null) {
    sessionStorage.setItem(name, r[2])
  }
  return r && r[2] ? r[2] : ''
}

/**
 * 从url中获得语言环境
 */
export function getLanguageFromUrl() {
  const language = getParamsFromUrl('language')
  return language
}

export function chooseByLanguage(zhParams, enParams) {
  const language = getLanguage()
  return language === 'zh-CN' ? zhParams : enParams
}

function onScroll(element, callBack) {
  let { scrollTop, clientHeight, scrollHeight } = element

  // 距离底部50px的时候 开始回调
  if (scrollHeight - (scrollTop + clientHeight) < 50) {
    callBack()
  }
}

let onScroll_throttle = throttle(onScroll, 200, {
  trailing: true,
  leading: false
})
/**
 * 页面滚动到底部触发监听,执行回调
 * @param callBack
 */
export function scrollToBottom(element, callBack) {
  element.onscroll = () => {
    onScroll_throttle(element, callBack)
  }
  return () => {
    element.onscroll = null
  }
}
export function genFileName(nameArray) {
  let max = 0
  let folderName = i18n.global.t('space.folder')
  nameArray.forEach((item) => {
    let match = item.replace(folderName, '')
    if (/^\d+$/.test(match)) {
      max = Math.max(max, match)
    }
  })
  return folderName + (max + 1)
}

export const ArrayBufferToWordArray = (arrayBuffer) => {
  const u8 = new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength)
  const len = u8.length
  const words = []
  for (let i = 0; i < len; i += 1) {
    words[i >>> 2] |= (u8[i] & 0xff) << (24 - (i % 4) * 8)
  }
  return CryptoJS.lib.WordArray.create(words, len)
}

export const WordArrayToArrayBuffer = (wordArray) => {
  const { words } = wordArray
  const { sigBytes } = wordArray
  const u8 = new Uint8Array(sigBytes)
  for (let i = 0; i < sigBytes; i += 1) {
    const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
    u8[i] = byte
  }
  return u8
}

/**
 * blob to base64
 */
export function blobToDataURL(blob) {
  let res, rej, promise
  promise = new Promise((r, j) => {
    res = r
    rej = j
  })
  let  reader = new FileReader()
  reader.onload = function () {
    res(this.result)
  }
  reader.readAsDataURL(blob)
  return promise
}

/**
 * blob to string
 */
export function blobToString(blob) {
  let res, rej, promise
  promise = new Promise((r, j) => {
    res = r
    rej = j
  })
  let  reader = new FileReader()
  reader.onload = function () {
    res(this.result)
  }
  reader.readAsText(blob, 'UTF-8')
  return promise
}

export function blobToArrayBuffer(blob) {
  let res, rej, promise
  promise = new Promise((r, j) => {
    res = r
    rej = j
  })
  let  reader = new FileReader()
  reader.onload = function () {
    res(this.result)
  }
  reader.readAsArrayBuffer(blob)
  return promise
}
/*
 *支持中文、英语、数字、下划线
 */
export function checkName(nickname) {
  let  reg = /^[A-Za-z0-9_\u4e00-\u9fa5]{1,}$/
  if (!reg.test(nickname)) {
    return false
  }
  return true
}

let supportImg = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp', 'heic']
let supportFile = ['txt', 'pdf']
export const canOpenImg = support(supportImg)

export const canOpenFile = support(supportFile)

function support(suffixArr) {
  return (name) => {
    for (let i = 0; i < suffixArr.length; i++) {
      let suffix = suffixArr[i]
      let tmp = getPuffixAndSuffix(name)
      if (suffix == tmp.suffix) {
        return true
      }
    }
    return false
  }
}

/**
 * @desc 函数防抖---“立即执行版本” 和 “非立即执行版本” 的组合版本
 * @param func 需要执行的函数
 * @param wait 延迟执行时间（毫秒）
 * @param immediate---true 表立即执行，false 表非立即执行
 **/
export function debounce(func, wait, immediate) {
  let timer

  return function () {
    let context = this
    let args = arguments

    if (timer) clearTimeout(timer)
    if (immediate) {
      let  callNow = !timer
      timer = setTimeout(() => {
        timer = null
      }, wait)
      if (callNow) func.apply(context, args)
    } else {
      timer = setTimeout(function () {
        func.apply(context, args)
      }, wait)
    }
  }
}
/**
 * 去文件前缀及后缀
 */
export function getPuffixAndSuffix(name): { prefix: string; suffix: string } {
  let lastIndex = name.lastIndexOf('.')
  let length = name.length
  let suffix = name.substring(lastIndex)
  if (lastIndex != -1 && lastIndex == length - suffix.length) {
    let prefix = name.substring(0, lastIndex)
    let suffix = name.substring(lastIndex + 1)
    return { prefix, suffix }
  }
  return { prefix: '', suffix: '' }
}

export function throttle(fn, second = 100) {
  let timerHandle = null
  return (...args) => {
    if (timerHandle) return
    fn(...args)
    timerHandle = setTimeout(() => {
      timerHandle = null
    }, second)
  }
}

export function debubbe(fn, second = 100) {
  let timerHandle = null
  return (...args) => {
    if (timerHandle) {
      clearTimeout(timerHandle)
    }

    timerHandle = setTimeout(() => {
      fn(...args)
      timerHandle = null
    }, second)
  }
}

export let Cookie = {
  set: function (name, value, days, outDomain) {
    let  domain, domainParts, date, expires, host

    if (days) {
      date = new Date()

      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)

      expires = '; expires=' + date.toGMTString()
    } else {
      expires = ''
    }

    host = location.host

    if (host.split('.').length === 1) {
      // no "." in a domain - it's localhost or something similar

      document.cookie = name + '=' + value + expires + '; path=/'
    } else {
      if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?/.test(host)) {
        // host =>  192.168.124.19:3000
        domain = host.split(':')[0]
      } else {
        domainParts = host.split('.')

        domainParts.shift()

        domain = outDomain ? outDomain : '.' + domainParts.join('.')
      }

      document.cookie = name + '=' + value + expires + '; path=/; domain=' + domain
      // check if cookie was successfuly set to the given domain

      if (Cookie.get(name) == null || Cookie.get(name) != value) {
        // append "." to current domain
        if (!/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?/.test(host)) {
          // host =>  192.168.124.19:3000
          domain = '.' + host
        }
        document.cookie = name + '=' + value + expires + '; path=/; domain=' + domain
      }
    }
  },

  get: function (name) {
    let  nameEQ = name + '='

    let  ca = document.cookie.split(';')

    for (let  i = 0; i < ca.length; i++) {
      let  c = ca[i]

      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length)
      }

      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
    }

    return null
  },

  erase: function (name) {
    Cookie.set(name, '', -1, '')
  }
}



let  u = navigator.userAgent
let  isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 //android终端
let  isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) //ios终端
export function platformStr() {
  if (isAndroid) {
    return 'android'
  }
  if (isiOS) {
    return 'ios'
  }
}

export function isMobile() {
  let flag = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  )
  return flag
}

const platform = ref('mobile')
/**
 * 判断是移动还是pc端
 */
export function usePlatform() {
  onBeforeMount(() => {
    if (isMobile()) {
      platform.value = 'mobile'
    } else {
      platform.value = 'pc'
      if (window.innerWidth <= 750) {
        platform.value = 'mobile'
      } else {
        platform.value = 'pc'
      }
    }
  })
  return platform
}

export function genMobileRem() {
  if (isMobile()) {
    // 如果是移动端
    window.onload = function () {
      getRem(375, 100)
    }
    window.onresize = function () {
      getRem(375, 100)
    }
    getRem(375, 100)
  }
}

function getRem(pwidth, prem) {
  let  html = document.getElementsByTagName('html')[0]
  let  oWidth = document.body.clientWidth || document.documentElement.clientWidth
  html.style.fontSize = (oWidth / pwidth) * prem + 'px'
}

export function OSnow() {
  let  agent = navigator.userAgent.toLowerCase()
  let  isMac = /macintosh|mac os x/i.test(navigator.userAgent)
  if (agent.indexOf('win32') >= 0 || agent.indexOf('wow32') >= 0) {
    return 'window'
  }
  if (agent.indexOf('win64') >= 0 || agent.indexOf('wow64') >= 0) {
    return 'window'
  }
  if (isMac) {
    return 'mac'
  }
}

// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time
        .replace(new RegExp(/-/gm), '/')
        .replace('T', ' ')
        .replace(new RegExp(/\.[\d]{3}/gm), '')
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}
export function myBrowser() {
  let  userAgent = navigator.userAgent //取得浏览器的userAgent字符串
  let  isOpera = userAgent.indexOf('Opera') > -1 //判断是否Opera浏览器
  let  isEdge = userAgent.indexOf('Edge') > -1 //判断是否IE的Edge浏览器
  let  isFF = userAgent.indexOf('Firefox') > -1 //判断是否Firefox浏览器
  let  isSafari = userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') == -1 //判断是否Safari浏览器
  let  isChrome = userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1 //判断Chrome浏览器

  if (isOpera) {
    return 'Opera'
  }
  if (isEdge) {
    return 'Edge'
  }
  if (isFF) {
    return 'Firefox'
  }
  if (isSafari) {
    return 'Safari'
  }
  if (isChrome) {
    let isEdge = userAgent.indexOf('Edg/')
    if (isEdge != -1) {
      return 'Edge'
    } else {
      return 'Chrome'
    }
  }
}

/**
 * 判断是否是开发环境
 */
export function isDev() {
  let host = window.location.host
  // host 中有冒号就代表是开发环境
  if (host.indexOf(':') > -1 && window.location.port == '3000') {
    return true
  }
  return false
}

function random(a, b) {
  let n = Math.round(Math.random() * (a - b) + b)
  return n
}

export function getRandomCode(number) {
  let codeStr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let str = ''
  for (let i = 0; i < number; i++) {
    let m = random(0, 61)
    str += codeStr.charAt(m)
  }
  return str
}

export const dealSpace = (num, danwei = 1000, kbStr = 'Kb', mBStr = 'Mb') => {
  // 先转换成 Kb
  let kb = num / danwei
  if (kb < danwei) {
    return `${kb.toFixed(1)}${kbStr}`
  } else {
    //Mb
    let mb = kb / danwei
    if (mb < danwei) {
      return `${mb.toFixed(1)}${mBStr}`
    } else {
      let gb = mb / danwei
      if (gb < danwei) {
        return `${gb.toFixed(1)}G`
      } else {
        let t = gb / danwei
        return `${t.toFixed(1)}T`
      }
    }
  }
}

//获取字符串的字节数
export function strCodeLength(str) {
  let count = 0 //初始化字节数递加变量并获取字符串参数的字符个数
  if (str != '') {
    //如果存在字符串，则执行
    let len = str.length
    for (let i = 0; i < len; i++) {
      //遍历字符串，枚举每个字符
      if (str.charCodeAt(i) > 255) {
        //字符编码大于255，说明是双字节字符(即是中文)
        count += 2 //则累加2个
      } else {
        count++ //否则递加一次
      }
    }
    return count //返回字节数
  } else {
    return 0 //如果参数为空，则返回0个
  }
}

export function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  )
}

type LanStr = 'zh-CN' | 'en-US'

/**
 * 获得语言环境
 */
export function getLanguage(): LanStr {
  // en-US  zh-CN
  let language = localStorage.getItem('language')
  return (language as unknown as LanStr) || 'zh-CN'
}

/**
 * base64 转换成 字节数组
*/
export function base64ToByteArray(initializationVector) {
  return toByteArray(initializationVector)
}

/**
 * 字节数组转16进制字符串
*/
export function byteArrayToHexString(arr) {
    let result = ''
    arr.forEach((element) => {
      let tmp = element.toString(16)
      if (tmp.length == 1) {
        // 16进制必须为2位
        tmp = '0' + tmp
      }
      result = result + tmp
    })
    return result
  }