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
 * 存放一些业务常量
 */
export const errorCodeMap = {
  '-1': 'error.unknown',
  400: 'error.unknown',
  4014: 'error.number',
  4013: 'error.bkey',
  500: 'error.network',
  'ACC-4034': 'error.offline',
  'GW-4013': 'login.codeError',
  'GW-410': 'login.error_times',
}

/**
 * 根据类别生成文字
 */
export function genText(category, filter = false) {
  if (category === '') {
    return filter ? 'space.home_all' : 'space.home_myspace'
  } else if (category === 'picture') {
    return 'space.home_photo'
  } else if (category === 'video') {
    return 'space.home_video'
  } else if (category === 'document') {
    return 'space.home_document'
  } else if (category === 'other') {
    return 'space.home_other'
  }
}

/**
 * localstorage | sessionstorage | indexdb 等存储值时的key
 */
export const keyMap = {
  /**
   *  消息推送 下线 空间注销 key
   * */
  outDialogType: 'outDialogType',

  /**
   * 最近一次扫码时间
   * */
  lastScanQrCodeTime: 'lastScanQrCodeTime',

  /**
   * 是否开启自动登录
   **/
  autoLoginFlag: 'autoLoginFlag',

  /**
   * 头像key
   */
  personHeaderImage: 'personHeaderImage',

  /**
   * web端唯一标识字符
   */
  clientUUID: 'clientUUID',

  /**
   * 官网地址
   */
  webUrl: 'webUrl',

  /**
   * 主要用来取 refreshtoken
   */
  loginInfo: 'loginInfo',

  /**
   * 用户信息
   */
  __getPersonal__: '__getPersonal__',

  /**
   * 临时对称秘钥,由前端产生
   */
  tmpSecret: 'tmpSecret',

  /**
   * 免扫描登录标志位 0
   */
  noscanLogin: 'noscanLogin',

  /**
   * 登录凭证key
   */
  eluoxaccessToken: 'eluoxaccessToken',

  /**
   * 刷新凭证key
   */
  refreshToken: 'refreshToken',

  /**
   * 盒子公钥key
   */
  serPubkey: 'serPubkey',

  /**
   * 退出标志位
   */
  loginOutFlag: 'loginOutFlag',

  /**
   * 对称秘钥key
   */
  eluoxaeskey: 'eluoxaeskey',

  /**
   * 平台社区版307事件
   */
  eventOf307: 'eventOf307',

  /***
   * deviceModelNumber
   */
  deviceModelNumber: 'deviceModelNumber',
  /**
   * 语言环境
   */
  language: 'language',

  /**
   * 盒子地址
   */
  boxLanInfo: 'boxLanInfo',
  /**
   * 文件排序
  */
 fileSortType:'fileSortType',
 /**
  * 应用 关闭后不在提示存储前缀
 */
 appPrefix:'appPrefix',

 serviceConfig:'serviceConfig',

 showLog:'showLog'
}
