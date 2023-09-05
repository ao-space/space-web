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

export const dealSpace = (num, unit = 1024) => {
  // 先转换成 Kb
  let kb = num / unit
  if (kb < unit) {
    return `${kb.toFixed(2)}Kb`
  } else {
    //Mb
    let mb = kb / unit
    if (mb < unit) {
      return `${mb.toFixed(2)}Mb`
    } else {
      let gb = mb / unit
      if (gb < unit) {
        return `${gb.toFixed(2)}G`
      } else {
        let t = gb / unit
        return `${t.toFixed(2)}T`
      }
    }
  }
}

