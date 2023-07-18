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

import { FileStruct } from "@/api/model"

const   reg = /[\u4E00-\u9FA5]/ // 汉字正则

/**
 * 把文件列表按照是否是文件夹排序, 文件夹放文件的上面
 */
export function sortFileByDir(result) {
  const dirArray = [],
    otherArray = []
  result.forEach((item) => {
    if (item.isDir) {
      dirArray.push(item)
    } else {
      otherArray.push(item)
    }
  })
  result = [...dirArray, ...otherArray]
  return result
}

/**
 * 按照文件名称排序
 * 按照首字符是汉字 还是 非汉字 分类  然后在按名称的全部拼音排序
 */
export function sortFileByName(result, sortType) {
  let hanArray = [],
    yingArray = []
  result.forEach((item) => {
    if (item.nameType == 1) {
      hanArray.push(item)
    } else {
      yingArray.push(item)
    }
  })

  // 分别对2个数组进行排序

  if (sortType === 'asc') {
    // 升序
    //@ts-ignore
    yingArray = yingArray.sort((itemOne, itemTwo) => {
      return itemOne.pinyin > itemTwo.pinyin ? 1 : -1
    })
    //@ts-ignore
    hanArray = hanArray.sort((itemOne, itemTwo) => {
      return itemOne.pinyin > itemTwo.pinyin ? -1: 1
    })
    result = [...yingArray, ...hanArray]
  } else {
    //@ts-ignore
    yingArray =yingArray.sort((itemOne, itemTwo) => {
        const result = itemOne.pinyin > itemTwo.pinyin ? -1 : 1
        return  result
      })
      //@ts-ignore
    //   console.log('排序前',sortType,result)
      hanArray = hanArray.sort((itemOne, itemTwo) => {
       const result =  itemOne.pinyin > itemTwo.pinyin ? 1: -1
    //    console.log(result)
        return result
      })
    //   console.log('排序后',sortType,hanArray)
    result = [...hanArray, ...yingArray]
  }
  return result
}


  /**
   * 添加nameType 及 pinyin
   */
 export function addNameTypeAndPinyin(element: FileStruct | {folderName:string, uuid:string,name?:string,nameType?:number,pinyin?:string}) {
    if (reg.test(element.name[0])) {
      // 以汉字开头
      element.nameType = 1
    } else {
      element.nameType = 0
    }
    element.pinyin = ''
    return element
  }

