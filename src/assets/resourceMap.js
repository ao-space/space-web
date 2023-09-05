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

import floder from './floder.png'
import pdf from './pdf.png'
import ppt from './ppt.png'
import excel from './excel.png'
import word from './word.png'
import image from './image.png'
import video from './video.png'
import text from './text.png'
import audio from './audio.png'
import html from './html.png'
import rar from './compress.png'
import other from './unknown.png'
import moreFile from './duowenjian.png'

export const resouceMap = {
  floder: floder,
  pdf: pdf,
  ppt: ppt,
  excel: excel,
  word: word,
  image: image,
  video: video,
  text: text,
  audio: audio,
  rar: rar,
  html: html,
  other: other,
  moreFile: moreFile,
}

let imageSuffix = [
  '.png',
  '.jpeg',
  '.heic',
  '.livp',
  '.bmp',
  '.jpg',
  '.png',
  '.tif',
  '.gif',
  '.pcx',
  '.tga',
  '.exif',
  '.fpx',
  '.svg',
  '.psd',
  '.cdr',
  '.pcd',
  '.dxf',
  '.ufo',
  '.eps',
  '.ai',
  '.raw',
  '.WMF',
  '.webp',
  '.avif',
  '.apng',

]
let pdfSuffix = ['.pdf']
let pptSuffix = ['.ppt', 'pptx']
let excelSuffix = ['.xls', 'xlsx']
let wordSuffix = ['.doc', 'docs', '.docx']
let htmlSuffix = ['.htm', 'html']
let rarSuffix = ['.rar', 'zip']
let videoSuffix = [
  '.mp4','.MP4',
  '.webm','.WEBM',
  '.ogv','.OGV',
  '.ogg','.OGG',
  '.mov','.MOV',
  '.wmv','.WMV',
  '.asf','.ASF',
  '.asx','.ASX',
  '.rm','.RM',
  '.rmvb','.RMVB',
  '.mpg','.MPG',
  '.mpeg','.MPEG',
  '.mpe ','.MPE',
  '.3gp','.3GP',
  '.m4v','.M4V',
  '.avi','.AVI',
  '.dat','.DAT',
  '.mkv','.MKV',
  '.flv', '.FLV',
  '.vob', '.VOB',
]
let textSuffix = ['.txt']
let audioSuffix = ['.mp3']
/**
 * 判断 name 的后缀是否在suffixArr 中
 */
function endOfSomeOfSuffix(suffixArr, name) {
  return suffixArr.some((item) => {
    let index = name.lastIndexOf(item)
    let suffix = name.slice(index)
    if (suffix == item) {
      return true
    } else {
      return false
    }
  })
}

/**
 判断是否是word文件
*/
export function isWord(name) {
  return endOfSomeOfSuffix(wordSuffix, name)
}

/**
 * 传入名称,根据名称的后缀判断是什么类型的文件,并返回默认图标
 * item => {isDir,name}
 */
export function genSrc(item) {
  let src
  if (item.isDir) {
    src = resouceMap.floder
  } else if (item.is_moreFile) {
    src = resouceMap.moreFile
  } else {
    let name = item.name || item.fileName || ''
    name = name.toLowerCase();
    if (endOfSomeOfSuffix(pdfSuffix, name)) {
      // pdf
      src = resouceMap.pdf
    } else if (endOfSomeOfSuffix(pptSuffix, name)) {
      // ppt
      src = resouceMap.ppt
    } else if (endOfSomeOfSuffix(excelSuffix, name)) {
      // execl
      src = resouceMap.excel
    } else if (endOfSomeOfSuffix(imageSuffix, name)) {
      // 图片
      src = resouceMap.image
    } else if (endOfSomeOfSuffix(videoSuffix, name)) {
      // 视频
      src = resouceMap.video
    } else if (endOfSomeOfSuffix(textSuffix, name)) {
      // text
      src = resouceMap.text
    } else if (endOfSomeOfSuffix(audioSuffix, name)) {
      // audio
      src = resouceMap.audio
    } else if (endOfSomeOfSuffix(wordSuffix, name)) {
      src = resouceMap.word
    } else if (endOfSomeOfSuffix(htmlSuffix, name)) {
      src = resouceMap.html
    } else if (endOfSomeOfSuffix(rarSuffix, name)) {
      src = resouceMap.rar
    } else {
      src = resouceMap.other
    }
  }
  return src
}
