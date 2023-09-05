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

class ArrayUtils {

  getIndex(list: [], item: any) {
    return list.findIndex((value: any) => {
      return item == value
    })
  }

  remove(list: [], item: any) {
    let index = list.findIndex((value: any) => {
      return item == value
    })
    if (index != -1) list.splice(index, 1)
  }

  mapToListForKeyAndDesc(iterator){
    let list = this.mapToListForKey(iterator);
    return list.sort().reverse();
  }

  mapToListForKey(iterator){
    let array = new Array();
    for(let value of iterator.keys()){
      array.push(value);
    }
    return array;
  }

  mapToListForValue(iterator){
    let fileList = [];
    for(let ele of iterator.values()){
      fileList.push(ele);
    }
    return fileList;
  }
}
export let arrayUtils = new ArrayUtils()
