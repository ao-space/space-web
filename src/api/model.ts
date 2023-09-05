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

export interface RealCallRequest<T, E> {
  requestId?: String
  serviceName: String
  apiName: String
  apiVersion: String
  headers?: { [key: string]: any }
  queries?: T
  entity?: E //对应网关body
  [key: string]: any
}

export interface FileParam {
  uuid?: string
  page?: number
  pageSize?: number
  pageNum?: number
  category?: string // 图片 视频 文档 其他
  orderBy?: string //排序 字段name asc name desc      operation_time asc  operation_time desc
  name?: string // 搜索字段
}

/**
 * 文件搜索参数
 */
export interface SearchFileParam {
  name: String
  category: String
}

type successFn = (error: Error, blod: any,last?) => void
interface params {
  loaded: number
  total: number
  [key: string]: any
}
export type progressFn = (percent: string, all: params) => void
type actionType = 'upload' | 'download'
export interface DownOptions {
  file?: File // 待上传的文件
  encryptedFile?: File // 加密之后的待上传文件
  name: string
  method?: string
  success?: successFn // 成功下载
  fail?: (e) => void // 下载失败
  progress?: progressFn // 进度条事件
  autoSave: boolean // 是否自动保存文件
  begin?: () => void // 开始下载事件
  __uuid?: string //唯一id 不需要手动赋值
  __resolve?: (value: unknown) => void // 承诺 用于后面取消请求
  __reject?: () => void // 拒绝函数
  type?: actionType
  url?: string //链接地址
  uploadParam?: FormData | Blob // 上传参数
  downloadParam?: any // 下载参数
  range: string // 部分下载文件参数  Range: bytes=0-10
  timeout?: number
  headers: object //token
}

export interface FileDeleteParam {
  uuid: Array<string>
}
export interface encyptFileParams {
  file: File
}

export interface LoginInfo {
  accessToken: string
  boxName?: string
  boxUUID?: string
  encryptedSecret: string
  expiresAt: string
  expiresAtEpochSeconds: number
  refreshToken: string
  autoLogin: boolean
  aoid: string
  boxLanInfo: object
}

/**
 * 返回的数据结构
 */
export interface ResponseStruct<T> {
  code: number
  message: string
  requestId: string
  results: T
}

/**
 * 文件列表返回结果
 */
export interface FileListResponseStruct extends ResponseStruct<FileListStruct<FileStruct>> {}
/**
 * 文件列表结构
 */
export interface FileListStruct<FileStruct> {
  fileList: Array<FileStruct>
  pageInfo: { page: number; pageSize: number; count: number; total: number }
}

export interface FileStruct {
  betag?: string
  bucketName?: string
  category: string
  createdAt?: number
  executable?: boolean
  fileCount?: number
  isDir: boolean
  md5sum?: string
  mime?: string
  modifyAt?: number
  name: string
  operationAt?: number
  path: string
  oldPath?: string // 移动复制之前的目录
  size: number
  tags?: string
  transactionId?: number
  trashed?: number
  userId?: number
  uuid: string // 文件的后台uuid 真实uuid
  version?: number
  child?: Array<FileStruct>
  frontUUid?: string // 前端创建的uuid
  oldServerUUid?: string // 老的服务端uuid
  parentUuid?: string
  nameType?: number // 0=> 非拼音开头  1=> 拼音开头
  pinyin?:string // nameType=>1 时 取值
}

export interface FileActionStruct {
  actionType: string
  [key: string]: string
}

export enum ActionType {
  CREATEFloder = 1,
  MOVE = 2,
  DELETE = 3,
  RENAME = 4,
  COPY = 5,
  RESTORE = 6,
  CLEAR = 7,
}

export enum JobStatus {
  PENGING = 1, // 待执行
  FAIL, // 失败
  SUCCESS,
}

export interface ExecInfo {
  arg: any // 执行参数
  fn?: Function // 待执行参数
  requestFnName: string // 请求函数映射名称
  argAfterRequest: any // 请求之后 成功或失败需要做的动作的参数
}
/**
 * 任务结构
 */
export interface QueueJobStruct {
  jobId?: string // 任务队列
  targetFileInfo: FileStruct | Array<FileStruct> // 待操作文件
  actionType: ActionType // 动作
  parentFileInfo?: FileStruct
  toFolderInfo?: FileStruct | Array<FileStruct> // 文件被放到哪了
  createTime?: Date // 创建时间
  status?: JobStatus // 任务状态 执行标志
  execInfo?: ExecInfo // 执行信息
  child?: Array<QueueJobStruct> // 在这个操作的基础上的操作,比如新建文件夹之后,在这个文件夹的基础上做的事情
  parentJob?: QueueJobStruct // 父操作 该操作依赖父操作
}

export type Category = 'picture' | 'video' | 'document' | 'other'

export interface CacheStruct<T> {
  time: number
  data: T
}

export interface FileListMapStorageCache {
  [key: string]: FileStruct
}

/**
 * 每个job 被包装的类型
 */
export interface JobInfo {
  fn: (preJobInfo: QueueJobStruct, preJobResult: ResponseStruct<any>) => Promise<any>
  jobInfo: QueueJobStruct
}

/**
 * 被复制的文件的uuid 映射
 */
export interface CopyFileUUidMap {
  oldId: string // 被复制文件的uuid
  newId: string // 复制之后新产生的uuid
}

/**
 * 创建文件夹的body结构体
 */
export interface FloderCreateEntityStruct {
  currentDirUuid: string //父文件夹uuid
  folderName: string // 文件夹名称
}

/**
 * 老uuid 和 新uuid 映射 的 value
 */
export interface OldUUidtoNewUUidAndCallbacks {
  newUUid: string
  callbacks: Array<Function> // 依赖老uuid 更新新uuid 之后的回调
}

/**
 * 老uuid和新uuid的映射
 */
export interface OldUUidNewUUidStruct {
  [key: string]: OldUUidtoNewUUidAndCallbacks
}

export interface UpLoadCreate {
  fileName: string
  folderId?: string
  folderPath?: string
  betag: string
  size: number
  mime: string
  createTime: number
  albumId: number
  BusinessId: number
}

/**
 断点续传文件上传参数
*/
export interface SequelUploadParams {
  md5sum: string
  uploadId: string
  start: number
  end: number
  file: Blob
  success?: Function
  fail?: Function
  progress?: Function
  index?:number
}


