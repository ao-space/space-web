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
import dayjs from 'dayjs'
import { t,d } from '@/language/index'

export type OptType = 'logout' | 'member_delete' | 'member_self_delete' | 'revoke'

export interface MessageResponse {
  status: string
  version: string
  message?: MessageBody
}

export interface MessageBody {
  optType: OptType
  data: any
}

/**
 * 消息通知类型
 * logout 强制下线  member_delete 注销账号
 */
export enum NotificationType {
  offlineByOtherClient = 'logout',
  cancelAccount = 'member_delete',
  memberSelfDelete = 'member_self_delete',
  revoke = 'revoke',
  restoreSuccess = 'restore_success',
  applet_operator = 'applet_operator'
}

type NoticeTextMap = {
  [key in NotificationType]: string
}

export const messageTypeToEventMap: NoticeTextMap = {
  logout: 'showOutDialog',
  member_delete: 'showOutDialog',
  member_self_delete: 'showOutDialog',
  revoke: 'showOutDialog',
  restore_success: 'backupNotify',
  applet_operator: 'appletOperator'
}

export const noticeTextMap: NoticeTextMap = {
  logout: t('notify.logout_desc'),
  member_delete: t('notify.member_delete_desc'),
  member_self_delete: t('notify.member_delete_desc'),
  revoke: t('notify.logout_desc'),
  restore_success: t('notify.restore_success_desc'),
  applet_operator: ''
}

export const noticeTitleMap: NoticeTextMap = {
  logout: t('notify.revoke'),
  member_delete: t('notify.member_self_delete'),
  member_self_delete: t('notify.member_self_delete'),
  revoke: t('notify.revoke'),
  restore_success: t('notify.restore_success'),
  applet_operator: ''
}

export function getMessageBean(messageBody) {
  // 这里特殊处理一下 optType 为 applet_operator
  if (messageBody.optType == 'applet_operator') {
    let data = messageBody.data
    let title = '',
      content = ''
    try {
      data = JSON.parse(data)
      const miniappName = data.appletInfoRes.name
      const appletOperatorType = data.appletOperatorType

      if (appletOperatorType == 'UNINSTALL') {
        title = t('notify.uninstall')
        content = t('notify.uninstall_desc',{appName: miniappName})
      }
    } catch (e) {}
    return {
      optType: messageBody.optType,
      title: title,
      content: content,
      messageTime: getMessageTime(messageBody.createAt),
      eventName: messageTypeToEventMap[messageBody.optType] || ''
    }
  } else if (messageBody.optType == 'memories') {
    let data = messageBody.data
    try {
      data = JSON.parse(data)
    } catch (e) {}
    return {
      albumId: data.albumId,
      optType: messageBody.optType,
      title: t('album.memories'),
      content: t('notify.memories_desc'),
      messageTime: getMessageTime(messageBody.createAt),
      eventName: messageTypeToEventMap[messageBody.optType] || ''
    }
  } else {
    return {
      optType: messageBody.optType,
      title: noticeTitleMap[messageBody.optType] || '',
      content: noticeTextMap[messageBody.optType] || '',
      messageTime: getMessageTime(messageBody.createAt),
      eventName: messageTypeToEventMap[messageBody.optType] || ''
    }
  }
}

function getMessageTime(createAt) {
  let currentDay = dayjs().startOf('day')
  let yesterday = currentDay.subtract(1, 'day')

  let date = dayjs(createAt)
  if (date.isAfter(currentDay)) {
    return dayjs(date).format('HH:mm')
  } else if (date.isAfter(yesterday)) {
    return t('index.time_yesterday')+' ' + dayjs(date).format('HH:mm')
  }
  return d(new Date(createAt), 'dynamic')
}

export function isWebMessageType(dialogType) {
  return (
    dialogType == NotificationType.offlineByOtherClient ||
    dialogType == NotificationType.cancelAccount ||
    dialogType == NotificationType.memberSelfDelete ||
    dialogType == NotificationType.revoke
  )
}

/**
 * 从localstorage 中获得消息通知类型
 */
export function getShowOutDialogType() {
  return localStorage.getItem(keyMap.outDialogType) as OptType
}

/**
 * 设置消息通知类型 到 localstorage 中
 */
export function setShowOutDialogType(notifyType: OptType) {
  localStorage.setItem(keyMap.outDialogType, (<unknown>notifyType) as string)
}
