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
import { urlConfig } from '@/config/networkConfig'
import { FileParam, RealCallRequest } from '@/api/model'
import { strToHex,myBrowser } from '@/utils/help'
import { keyMap } from '@/utils/constant'
let baseUrl = urlConfig.baseUrl

/**
 * 验证安全邮箱
 */
export function validateEmail(email,emailPasswd, emailConfig) {
  let params = {
    emailAccount: email,
    emailPasswd: strToHex(emailPasswd),
    clientUuid:localStorage.getItem(keyMap.clientUUID),
    host: emailConfig.host,
    port: emailConfig.port,
    sslEnable: emailConfig.sslEnable,
  }

  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'security_email_verify',
    serviceName: 'eulixspace-account-service',
    entity: params,
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 通过密码设置安全邮箱
 */
export function modifyEmail(token,email,emailPasswd, emailConfig) {
  let params = {
    securityToken: token,
    emailAccount: email,
    emailPasswd: strToHex(emailPasswd),
    host: emailConfig.host,
    port: emailConfig.port,
    sslEnable: emailConfig.sslEnable,
  }

  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'security_email_modify_auther',
    serviceName: 'eulixspace-account-service',
    entity: params,
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 通过密码设置安全邮箱
 */
export function bindEmail(token,email,emailPasswd, emailConfig) {
  let params = {
    securityToken: token,
    emailAccount: email,
    emailPasswd: strToHex(emailPasswd),
    host: emailConfig.host,
    port: emailConfig.port,
    sslEnable: emailConfig.sslEnable,
  }

  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'security_email_set_auther',
    serviceName: 'eulixspace-account-service',
    entity: params,
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 获取绑定的邮箱
 */
export function getBindEmail() {
  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'security_email_setting',
    serviceName: 'eulixspace-account-service',
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 发送手机确认
 */
export function sendPhoneConfirm() {
  let params ={
    deviceInfo:myBrowser(),
  }

  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'security_passwd_modify_auther_apply',
    serviceName: 'eulixspace-account-service',
    entity: params,
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 查询手机是否确认
 */
export function queryPhoneConfirm() {
  let params ={
    clientUuid:localStorage.getItem(keyMap.clientUUID),
  }

  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'security_message_poll',
    serviceName: 'eulixspace-account-service',
    entity: params,
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 密码重置
 */
export function resetModify(token,emailToken,clientUuidBinder,newPasswd) {
  let params ={
    acceptSecurityToken: token,
    emailSecurityToken:emailToken,
    clientUuid:clientUuidBinder,
    newPasswd:newPasswd,
  }

  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'security_passwd_reset_auther',
    serviceName: 'eulixspace-account-service',
    entity: params,
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 通过老密码设置新密码
 */
export function passwdModify(token,clientUuidBinder,oldPasswd,newPasswd) {
  let params ={
    securityToken: token,
    clientUuid:clientUuidBinder,
    oldPasswd: oldPasswd,
    newPasswd:newPasswd,
  }

  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'security_passwd_modify_auther',
    serviceName: 'eulixspace-account-service',
    entity: params,
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 验证密码
 */
export function passwdVerify(password) {
  let params = {
    oldPasswd: password,
  }

  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'security_passwd_verify',
    serviceName: 'eulixspace-account-service',
    entity: params,
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 获取邮箱配置
 */
export function getEmailConfig() {

  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'security_email_configurations',
    serviceName: 'eulixspace-account-service',
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 获取全部消息
 */
export function getNotification(page) {
  let params = {
    page: page,
  }

  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'notification_get_all',
    serviceName: 'eulixspace-account-service',
    entity: params,
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}

/**
 * 删除全校消息
 */
export function clearAllNotification() {

  let request: RealCallRequest<FileParam, any> = {
    apiVersion: 'v1',
    apiName: 'notification_delete_all',
    serviceName: 'eulixspace-account-service',
    entity:{messageId:[]}
  }
  return post(`${baseUrl}/space/v1/api/gateway/call`, request)
}
