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

import { keyMap } from '@/utils/constant'
import { genPromise } from '@/utils/help'

/**
 * 封装免扫描登录逻辑
 * @return {type:'goQRcode(去二维码界面) | goNoScan(去免扫描界面)'}
 */
export function getLoginType() {
  let { resolve, promise } = genPromise()
  let lastScanQrCodeTime = parseInt(getScanTime())

  let now = new Date().getTime()
  // 距离上次扫码时间大于30天
  if (now - lastScanQrCodeTime >= 30 * 24 * 60 * 60 * 1000) {
    resolve({
      type: 'goQRcode',
    })
  } else {
    resolve({
      type: 'goNoScan',
    })
  }
  return promise
}

/**
 * 得到扫码时间
 */
export function getScanTime() {
  return localStorage.getItem(keyMap.lastScanQrCodeTime)
}

/**
 * 设置扫码时间
 * 和登录 合并
 */
// export function setScanTime() {
//   let now = new Date().getTime() + ''
//   localStorage.setItem(keyMap.lastScanQrCodeTime, now)
// }

/**
 * 得到是否开启自动登录
 */
export function getLocalStorageAutoLoginFlag() {
  let autoLoginFlag = localStorage.getItem(keyMap.autoLoginFlag)
  if (autoLoginFlag == '1') {
    return true
  }
  return false
}

/**
 * 得到sessionstorage 里面的 autoLoginFlag
 */
// export function getSessionAutoLoginFlag() {
//   let autoLoginFlag = sessionStorage.getItem(keyMap.autoLoginFlag)
//   if (autoLoginFlag == '1') {
//     return true
//   }
//   return false
// }

/**
 * 设置是否开启自动登录标志位,
 *
 * 已经 和setLoginInfo 合并了
 */
// export function setAutoLoginFlag(autoLogin) {
//   let autoLoginFlag = autoLogin ? '1' : '0'
//   localStorage.setItem(keyMap.autoLoginFlag, autoLoginFlag)
//   //  sessionstorage 里面的都是为1 通过登录的，刷新时不跳转到 noscanlogin 页面
//   //sessionStorage.setItem(keyMap.autoLoginFlag, '1')
// }
