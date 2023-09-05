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

export interface downDetail {
  fileType: string //文件类型 1 文件夹  2 pdf 3 ppt 4 execl  5 word
  fileName: string // 文件名称
  totalLength: number // 总长度
  status: string // 状态 0 等待开始 1 正在下载  2 下载完成 3 下载失败 4 取消下载
  currentLength: number // 已下载长度
  speed: string // 下载速度
  url: string // 链接地址
  uuid: string // 唯一标示
}

export interface fileInfo {
  bucketName: string
  category: string
  createdAt: number
  executable: Boolean
  isDir: Boolean
  md5sum: string
  mime: string
  name: string
  path: string
  size: number
  tags: string
  trashed: boolean
  updatedAt: number
  uuid: string
}
