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

export type RequestType = 'authScopes' | 'authConfirm' | 'tokenCreate' | 'tokenRefresh'

type ResponseType = RequestType

export interface AuthorizeRequest {
  id: string // 标示请求id 回复结果时会带上
  requestType?: RequestType
  methodName?:string
  params: any // 参数
}

export interface AuthorizeResponse<T> {
  id: string // 请求时的id,方便映射上对应的AuthorizeRequest
  responseType: ResponseType
  data?: T // 返回值
}

export interface AuthScopeResponse<T> {
  appletId: string
  categories: Array<T>
  expiresIn: number
}

export interface AuthScopeCategory {
  addressbook: Array<string>
  'userinfo-readonly': Array<string>
}

export interface MiniRequest{
    id: string // 标示请求id 回复结果时会带上
    requestType?: string
    params: any // 参数 
    methodName?: string
}

/**
 * 返回消息提
 */
 export interface MessgeReturn {
    id: string
    responseType: string
    code: number
    data: any
    msg?: string
  }
